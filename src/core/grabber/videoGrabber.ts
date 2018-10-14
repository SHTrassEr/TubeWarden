import { youtube_v3 } from "googleapis";

import Video from "../../models/db/video";
import GoogleVideoService from "../service/googleVideoService";
import VideoService from "../service/videoService";

export default class VideoGrabber {

    protected googleVideoService: GoogleVideoService;
    protected videoService: VideoService;

    constructor(googleVideoService: GoogleVideoService) {
        this.googleVideoService = googleVideoService;
        this.videoService = new VideoService();
    }

    public async processEmptyChannelId(maxResult: number): Promise<number> {
        const videoList = await Video.findAll({
            limit: maxResult,
            where: {
                deleted: false,
                channelId: null,
        }});

        if (videoList.length > 0) {
            await this.updateList(videoList);
        }

        return videoList.length;
    }

    public async updateList(videoList: Video[]): Promise<any> {
        const videoIdList = videoList.map((v) => v.videoId);
        const videoInfoList = await this.googleVideoService.getVideoInfo(videoIdList);
        const videoInfoHash = this.createVideoInfoHash(videoInfoList);

        for (const video of videoList) {
            if (videoInfoHash.has(video.videoId)) {
                await this.videoService.updateVideo(video, videoInfoHash.get(video.videoId));
            }
        }

        if (videoIdList.length !== videoInfoHash.size) {
            const deletedVideoIdList = videoIdList.filter((videoId) => !videoInfoHash.has(videoId));
            await this.videoService.setDeletedVideoList(deletedVideoIdList);
        }
    }

    protected createVideoInfoHash(infoList: youtube_v3.Schema$Video[]): Map<string, youtube_v3.Schema$Video> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj);
        }, new Map<string, youtube_v3.Schema$Video>());
    }

}
