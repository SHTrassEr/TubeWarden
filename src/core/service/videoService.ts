import { GoogleVideoInfo } from "../../models/google/itemInfo";

import Video from "../../models/db/video";
import VideoViolationDislike from "../../models/db/videoViolationDislike";
import VideoViolationLike from "../../models/db/videoViolationLike";
import ChannelService from "./channelService";
import GoogleVideoService from "./googleVideoService";
import StemmedWordService from "./stemmedWordService";
import SummaryService from "./summaryService";
import { SummaryKey } from "./summaryService";
import TagService from "./tagService";

export default class VideoService {

    protected channelService: ChannelService;
    protected tagService: TagService;
    protected summaryService: SummaryService;
    protected stemmedWordService: StemmedWordService;

    constructor() {
        this.channelService = new ChannelService();
        this.tagService = new TagService();
        this.summaryService = new SummaryService();
        this.stemmedWordService = new StemmedWordService();
    }

    public async updateVideo(video: Video, videoInfo: GoogleVideoInfo) {
        video.title = videoInfo.snippet.title;
        await this.updateVideoChannelId(video, videoInfo.snippet.channelId);
        await this.setVideoTagTitleList(video, videoInfo.snippet.tags);
        await this.stemmedWordService.setVideoStemmedWordList(video);

        if (video.changed()) {
            await video.save();
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
        await VideoViolationLike.create({videoId: video.videoId});
        await VideoViolationDislike.create({videoId: video.videoId});
        await this.summaryService.increment(SummaryKey.videoCount, 1);
        await this.setVideoTagTitleList(video, videoInfo.snippet.tags);
        await this.stemmedWordService.updateVideo(video.videoId);
        return video;
    }

    public async setDeletedVideoList(deletedVideoIdList: string[]) {
        if (deletedVideoIdList.length > 0) {
            return Video.update(
                { deleted: true, deletedAt: new Date(), nextStatisticsUpdateAt: null },
                { where: { videoId: deletedVideoIdList } },
            );
        }
    }

    protected async setVideoTagTitleList(video: Video, tagTitleList: string[]): Promise<Video> {
        const tagList = await this.tagService.getOrCreateTagList(tagTitleList);
        await video.$set("tags", tagList);
        return video;
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
}
