import { youtube_v3 } from "googleapis";

import Video from "../../models/db/video";
import GoogleVideoService from "../service/googleVideoService";
import VideoService from "../service/videoService";

export default class TrendsGrabber {

    protected googleVideoService: GoogleVideoService;
    protected auth;
    protected regionCode: string;
    protected videoService: VideoService;

    constructor(googleVideoService: GoogleVideoService, regionCode: string) {
        this.regionCode = regionCode;
        this.googleVideoService = googleVideoService;
        this.videoService = new VideoService();
    }

    public async process(maxResults: number): Promise<Video[]> {
        const trendsIdList = await this.googleVideoService.getMostPopularVideoId(this.regionCode, maxResults);
        if (trendsIdList && trendsIdList.length > 0) {
            const videoList = await Video.findAll({where: { videoId: trendsIdList }});
            const videoIdList = videoList.map((v) => v.videoId);
            await this.updateVideoList(videoIdList);
            const videoIdSet = new Set<string>(videoIdList);
            const newVideoIdList = trendsIdList.filter((videoId) => !videoIdSet.has(videoId));
            return this.createVideoList(newVideoIdList);
        }
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

    protected async updateVideoList(videoIdList: string[]): Promise<any> {
        return Video.update({
            trendsAt: new Date(),
            deleted: false,
            deletedAt: null,
        }, { where: { videoId: videoIdList }});
    }

}
