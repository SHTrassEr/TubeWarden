import { GoogleVideoInfo } from "../../models/google/itemInfo";

import Statistics from "../../models/db/statistics";
import Video from "../../models/db/video";
import ChannelService from "./channelService";
import GoogleVideoService from "./googleVideoService";
import TagService from "./tagService";

export default class VideoService {

    protected googleVideoService: GoogleVideoService;
    protected channelService: ChannelService;
    protected tagService: TagService;

    constructor(googleVideoService: GoogleVideoService) {
        this.googleVideoService = googleVideoService;
        this.channelService = new ChannelService();
        this.tagService = new TagService();
    }

    public async updateList(videoList: Video[]): Promise<any> {
        const videoIdList = videoList.map((v) => v.videoId);
        const videoInfoList = await this.googleVideoService.getVideoInfo(videoIdList);
        const videoInfoHash = this.createVideoInfoHash(videoInfoList);

        for (const video of videoList) {
            if (videoInfoHash.has(video.videoId)) {
                await this.updateVideo(video, videoInfoHash.get(video.videoId));
            }
        }

        if (videoIdList.length !== videoInfoHash.size) {
            const deletedVideoIdList = videoIdList.filter((videoId) => !videoInfoHash.has(videoId));
            await this.setDeletedVideoList(deletedVideoIdList);
        }
    }

    public async updateVideo(video: Video, videoInfo: GoogleVideoInfo) {
        video.title = videoInfo.snippet.title;
        await this.updateVideoChannelId(video, videoInfo.snippet.channelId);
        await this.setVideoTagTitleList(video, videoInfo.snippet.tags);

        if (video.changed()) {
            return video.save();
        }
    }

    public async createVideo(videoInfo: GoogleVideoInfo): Promise<Video> {
        let video = new Video();
        video.videoId = videoInfo.id;
        video.title = videoInfo.snippet.title;
        video.publishedAt = videoInfo.snippet.publishedAt;
        video.nextStatisticsUpdateAt = new Date();
        await this.updateVideoChannelId(video, videoInfo.snippet.channelId);
        video = await video.save();
        return this.setVideoTagTitleList(video, videoInfo.snippet.tags);
    }

    public async setDeletedVideoList(deletedVideoIdList: string[]) {
        if (deletedVideoIdList.length > 0) {
            return Video.update({ deleted: true, deletedAt: new Date() }, {where: {videoId: deletedVideoIdList}});
        }
    }

    protected async setVideoTagTitleList(video: Video, tagTitleList: string[]): Promise<Video> {
        const tagList = await this.tagService.getOrCreateTagList(tagTitleList);
        return  video.$set("tags", tagList);
    }

    protected async updateVideoChannelId(video: Video, channelId: string): Promise<any> {
        if (video.channelId === channelId) {
            return;
        }

        if (!channelId) {
            video.channel = null;
            video.channelId = null;
        }

        video.channel = await this.channelService.getOrCreateChannelById(channelId);
        video.channelId = channelId;
    }

    protected createVideoInfoHash(infoList: GoogleVideoInfo[]): Map<string, GoogleVideoInfo> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj);
        }, new Map<string, GoogleVideoInfo>());
    }
}
