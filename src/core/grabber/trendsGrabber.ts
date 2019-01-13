import { youtube_v3 } from "googleapis";

import StemmedWord from "../../models/db/stemmedWord";
import Video from "../../models/db/video";
import Word from "../../models/db/word";
import GoogleVideoService from "../service/googleVideoService";
import TrendStemmedWordService from "../service/trendStemmedWordService";
import VideoService from "../service/videoService";
import WordService from "../service/wordService";

export default class TrendsGrabber {

    protected googleVideoService: GoogleVideoService;
    protected auth;
    protected regionCode: string;
    protected videoService: VideoService;
    protected wordService: WordService;
    protected trendWordService: TrendStemmedWordService;

    constructor(googleVideoService: GoogleVideoService, regionCode: string) {
        this.regionCode = regionCode;
        this.googleVideoService = googleVideoService;
        this.videoService = new VideoService();
        this.wordService = new WordService();
        this.trendWordService = new TrendStemmedWordService();
    }

    public async process(maxResults: number): Promise<number> {
        const trendsIdList = await this.googleVideoService.getMostPopularVideoId(this.regionCode, maxResults);
        if (trendsIdList && trendsIdList.length > 0) {
            const videoList = await Video.findAll({where: { videoId: trendsIdList }});
            const videoIdList = videoList.map((v) => v.videoId);
            await this.updateVideoList(videoIdList);
            const videoIdSet = new Set<string>(videoIdList);
            const newVideoIdList = trendsIdList.filter((videoId) => !videoIdSet.has(videoId));
            await this.createVideoList(newVideoIdList);
            await this.updateTrendsNowStatus(trendsIdList);
            return trendsIdList.length;
        }

        return 0;
    }

    protected async createVideoList(newVideoIdList: string[]): Promise<Video[]> {
        const newVideoList = [];
        if (newVideoIdList.length > 0) {
            const videoInfoList = await this.googleVideoService.getVideoInfo(newVideoIdList);

            for (const videoInfo of videoInfoList) {
                newVideoList.push(await this.videoService.createVideo(videoInfo));
            }
        }

        return newVideoList;
    }

    protected async updateTrendsNowStatus(trendsIdList: string[]): Promise<number> {
        const date = new Date();
        for (const videoId of trendsIdList) {
            const video = await Video.findByPrimary(videoId, {include: [StemmedWord, Word]});
            if (video != null) {
                video.trendsAt = date;
                video.deleted = false;
                video.trendsNow = true;
                await video.save();
            }
        }

        return trendsIdList.length;
    }

    protected async updateVideoTrendsNowStatus(video: Video, trendsNow: boolean, date: Date): Promise<Video> {
        if (video.trendsNow !== trendsNow) {
            if (trendsNow) {
                // await this.trendWordService.addVideoTrendsWordList(video, date);
            } else {
                // await this.trendWordService.removeVideoTrendsWordList(video, date);
            }

            video.trendsNow = trendsNow;
        }

        video.trendsAt = date;
        video.deleted = false;
        video.trendsNow = true;
        await video.save();
        return video;
    }

    protected async updateVideoList(videoIdList: string[]): Promise<any> {
        return Video.update({
            trendsAt: new Date(),
            deleted: false,
            deletedAt: null,
        }, { where: { videoId: videoIdList }});
    }
}
