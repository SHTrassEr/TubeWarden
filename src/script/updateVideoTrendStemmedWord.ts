import { Op } from "sequelize";

import StemmedWord from "../models/db/stemmedWord";
import Video from "../models/db/video";
import Word from "../models/db/word";

import Config from "../config";
import ChannelGrabber from "../core/grabber/channelGrabber";
import VideoGrabber from "../core/grabber/videoGrabber";
import sequelize from "../sequelize";

import TrendStemmedWordService from "../core/service/trendStemmedWordService";

import createPager from "../utils/pager";

const trendStemmedWordService = new TrendStemmedWordService();

interface IVideoData {
    videoId: string;
    date: Date;
}

async function process(): Promise<any> {

    const dataList: IVideoData[] = await sequelize.query(`select s.videoId, s.createdAt as date from videos s where s.trendsAt is not null
    union all
    select e.videoId,
    (case
    when e.trendsAt = e.createdAt then ADDTIME(e.trendsAt, '0:5:0.0')
    else e.trendsAt
    end) as date from videos e where e.trendsAt is not null order by date, videoId;`,
    { type: sequelize.QueryTypes.SELECT});

    const videoIdSet = new Map<string, Video>();
    for (const data of dataList) {
        if (videoIdSet.has(data.videoId)) {
            await trendStemmedWordService.removeVideoTrendsWordList(videoIdSet.get(data.videoId), data.date);
            videoIdSet.delete(data.videoId);
        } else {
            const video = await Video.findById(data.videoId, {include: [StemmedWord]});
            if (video != null) {
                videoIdSet.set(video.videoId, video);
                await trendStemmedWordService.addVideoTrendsWordList(video, data.date);
            }
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
