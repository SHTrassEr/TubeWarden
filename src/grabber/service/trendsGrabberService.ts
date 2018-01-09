import { GoogleVideoInfo } from "../../models/google/ItemInfo";

import GoogleVideoService from "../../google/googleVideoService";
import Video from "../../models/db/Video";

export default class TrendsGrabberService {

    protected googleVideoService = new GoogleVideoService();
    protected auth;
    protected regionCode: string;
    protected maxResults: number;

    constructor(auth: any, regionCode: string, maxResults: number) {
        this.auth = auth;
        this.regionCode = regionCode;
        this.maxResults = maxResults;
    }

    public async update(): Promise<any> {
        const trendsIdList = await this.googleVideoService.getMostPopularVideoIdList(this.auth, this.regionCode, this.maxResults);
        if (trendsIdList && trendsIdList.length > 0) {
            const videoList = await Video.findAll({where: { videoId: trendsIdList }});
            const videoIdList = videoList.map((v) => v.videoId);
            await this.updateVideoList(videoIdList);
            const videoIdSet = new Set<string>(videoIdList);
            const newVideoIdList = trendsIdList.filter((videoId) => !videoIdSet.has(videoId));
            await this.createVideoList(newVideoIdList);
        }
    }

    protected async createVideoList(newVideoIdList: string[]): Promise<any> {
        if (newVideoIdList.length > 0) {
            const videoInfoList = await this.googleVideoService.getInfo(this.auth, newVideoIdList);

            for (const videoInfo of videoInfoList) {
                const newVideo  = this.createVideo(videoInfo);
                await newVideo.save();
            }
        }
    }

    protected async updateVideoList(videoIdList: string[]): Promise<any> {
        return Video.update({
            trendsAt: new Date(),
            deleted: false,
            deletedAt: null,
        }, { where: { videoId: videoIdList }});
    }

    protected createVideo(googleVideoInfo: GoogleVideoInfo): Video {
        const video = new Video();
        video.videoId = googleVideoInfo.id;
        video.title = googleVideoInfo.snippet.title;
        video.publishedAt = googleVideoInfo.snippet.publishedAt;
        video.channelId = googleVideoInfo.snippet.channelId;
        video.nextStatisticsUpdateAt = new Date();
        return video;
    }
}
