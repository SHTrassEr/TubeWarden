import { GoogleVideoInfo } from "../../models/google/itemInfo";

import Video from "../../models/db/video";
import GoogleVideoService from "../service/googleVideoService";
import VideoService from "../service/videoService";

export default class TrendsGrabber {

    protected googleVideoService: GoogleVideoService;
    protected auth;
    protected regionCode: string;
    protected videoService: VideoService;

    constructor(auth: any, regionCode: string) {
        this.auth = auth;
        this.regionCode = regionCode;
        this.googleVideoService = new GoogleVideoService(auth);
        this.videoService = new VideoService(this.googleVideoService);
    }

    public async process(maxResults: number): Promise<any> {
        const trendsIdList = await this.googleVideoService.getMostPopularVideoId(this.regionCode, maxResults);
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
            const videoInfoList = await this.googleVideoService.getVideoInfo(newVideoIdList);

            for (const videoInfo of videoInfoList) {
                await this.videoService.createVideo(videoInfo);
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

}
