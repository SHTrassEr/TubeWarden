import { Op } from "sequelize";

import StemmedWord from "../models/db/stemmedWord";
import Video from "../models/db/video";
import Word from "../models/db/word";

import sequelize from "../sequelize";

import { VideoTrendProcessStatus } from "../core/entity/VideoTrendProcessStatus";
import TrendStemmedWordService from "../core/service/trendStemmedWordService";

const trendStemmedWordService = new TrendStemmedWordService();

interface IVideoData {
    isStartDate: string;
    videoId: string;
    date: Date;
}

async function sleep(ms: number) {
    await _sleep(ms);
}

function _sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function process(): Promise<any> {

    const dataList: IVideoData[] = await sequelize.query(`select s.videoId, s.createdAt as date, 1 as isStartDate from videos s
    where s.trendsAt is not null and s.trendProcessStatus = 0
    union all
    select e.videoId,
    (case
    when e.trendsAt = e.createdAt then ADDTIME(e.trendsAt, '0:5:0.0')
    else e.trendsAt
    end) as date, 0 as isStartDate from videos e where e.trendsAt is not null and e.trendNow = 0
    and (e.trendProcessStatus = 0 or e.trendProcessStatus = 1)
    order by date, videoId;`,
    { type: sequelize.QueryTypes.SELECT});

    const videoIdSet = new Map<string, Video>();
    for (const data of dataList) {
        let video: Video;
        if (videoIdSet.has(data.videoId)) {
            video = videoIdSet.get(data.videoId);
        } else {
            video = await Video.findById(data.videoId, {include: [StemmedWord]});
            if (video != null) {
                videoIdSet.set(video.videoId, video);
            }
        }

        if (video != null) {
            if (data.isStartDate === "1") {
                await trendStemmedWordService.addVideoTrendsWordList(video, data.date);
                video.trendProcessStatus = VideoTrendProcessStatus.Start;
                await video.save();
            } else {
                await trendStemmedWordService.removeVideoTrendsWordList(video, data.date);
                video.trendProcessStatus = VideoTrendProcessStatus.End;
                await video.save();
                videoIdSet.delete(data.videoId);
            }

            await sleep(60);
        }
    }
}

sequelize.authenticate()
.then(() => {
    return process();
})
.then(() => {
    sequelize.close();
});
