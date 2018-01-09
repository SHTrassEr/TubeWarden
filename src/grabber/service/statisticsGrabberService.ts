import { GoogleVideoInfo, GoogleVideoStatistics } from "../../models/google/ItemInfo";

import Statistics from "../../models/db/Statistics";
import Video from "../../models/db/Video";

import GoogleVideoService from "../../google/googleVideoService";
import ViolationService from "./violationService";

export default class StatisticsGrabberService {

    protected googleVideoService = new GoogleVideoService();
    protected violationService = new ViolationService();
    protected auth;
    protected statisticsUpdateCfg;

    constructor(auth: any, statisticsUpdateCfg: any) {
        this.auth = auth;
        this.statisticsUpdateCfg = statisticsUpdateCfg;
    }

    public async update(videoIdList: string[]): Promise<any> {
        const statisticsInfoList = await this.googleVideoService.getStatistics(this.auth, videoIdList);
        const statisticsInfoHash = this.createStatisticsInfoHash(statisticsInfoList);
        const videoList = await Video.findAll({where: { videoId: Array.from(statisticsInfoHash.keys())}});
        for (const video of videoList) {
            await this.saveStatistics(video, statisticsInfoHash.get(video.videoId));
        }

        const deletedVideoIdList = videoIdList.filter((videoId) => !statisticsInfoHash.has(videoId));
        await this.updateDeletedVideoList(deletedVideoIdList);
    }

    protected async updateDeletedVideoList(deletedVideoIdList: string[]) {
        if (deletedVideoIdList.length > 0) {
            return Video.update({ deleted: true, deletedAt: new Date() }, {where: {videoId: deletedVideoIdList}});
        }
    }

    protected async saveStatistics(video: Video, statisticsInfo: GoogleVideoStatistics): Promise<any>  {
        const statistics = this.createStatistics(video.videoId, statisticsInfo);
        const reqiredItemCnt = this.violationService.getRequredItemCnt();
        const statisticsList = await this.getLastStatistics(video.videoId, reqiredItemCnt);

        if (this.violationService.isStatisticsAtLine(statistics, statisticsList)) {
            const lastStatistics = statisticsList[statisticsList.length - 1];
            this.initStatistics(lastStatistics, statisticsInfo);
            await lastStatistics.save();
        } else {
            await statistics.save();
            statisticsList.push(statistics);
        }

        return this.updateVideo(video, statisticsList);
    }

    protected async updateVideo(video: Video, statisticsList: Statistics[]): Promise<any> {
        if (statisticsList && statisticsList.length > 0) {
            video.statisticsUpdatedAt = new Date();

            const lastSt: Statistics = statisticsList[statisticsList.length - 1];

            let violated: boolean = false;

            if (this.violationService.check(statisticsList, "likeCount")) {
                video.likeViolationCnt ++;
                violated = true;
            }

            if (this.violationService.check(statisticsList, "dislikeCount")) {
                video.dislikeViolationCnt ++;
                violated = true;
            }

            if (violated) {
                video.lastViolationAt = new Date();
            }

            video.nextStatisticsUpdateAt = this.getNextUpdateTime(video);
            video.likeCount = lastSt.likeCount;
            video.dislikeCount = lastSt.dislikeCount;
            video.viewCount = lastSt.viewCount;
            return video.save();
        }
    }

    protected async getLastStatistics(videoId: string, itemCount: number): Promise<Statistics[]> {
        const statisticsList = await Statistics.findAll({
            where: { videoId },
            order: [
                ["createdAt", "DESC"],
            ],
            limit: itemCount,
        });

        statisticsList.reverse();
        return statisticsList;
    }

    protected createStatisticsInfoHash(infoList: GoogleVideoInfo[]): Map<string, GoogleVideoStatistics> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj.statistics);
        }, new Map<string, GoogleVideoStatistics>());
    }

    protected createStatistics(videoId: string, statisticsInfo: GoogleVideoStatistics): Statistics {
        const date = new Date();
        const statistics = new Statistics();
        statistics.videoId = videoId;
        statistics.createdAt = date;
        statistics.updatedAt = date;
        this.initStatistics(statistics, statisticsInfo);
        return statistics;
    }

    protected initStatistics(statistics: Statistics, statisticsInfo: GoogleVideoStatistics): void {
        statistics.viewCount = statisticsInfo.viewCount;
        statistics.likeCount = statisticsInfo.likeCount;
        statistics.dislikeCount = statisticsInfo.dislikeCount;
        statistics.commentCount = statisticsInfo.commentCount;
    }

    protected getDateDiffMinutes(dateStart: Date, dateEnd: Date): number {
        return (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60);
    }

    protected getDateAddMinutes(date: Date, min: number): Date {
        return new Date(date.getTime() + min * 60 * 1000);
    }

    protected getNextUpdateTime(video: Video): Date {
        let lastViolationAt: Date = video.createdAt;
        if (video.lastViolationAt) {
            lastViolationAt = video.lastViolationAt;
        }

        const diff = this.getDateDiffMinutes(lastViolationAt, video.statisticsUpdatedAt);

        if (diff <= this.statisticsUpdateCfg.lowDealyAt) {
            return this.getDateAddMinutes(video.statisticsUpdatedAt, this.statisticsUpdateCfg.delayMin);
        }

        if (diff > this.statisticsUpdateCfg.lowDealyAt && diff <= this.statisticsUpdateCfg.endAt) {
            const c = ((diff - this.statisticsUpdateCfg.lowDealyAt) /
                (this.statisticsUpdateCfg.endAt - this.statisticsUpdateCfg.lowDealyAt));
            const delay =  (1 - c) * this.statisticsUpdateCfg.delayMin + c * this.statisticsUpdateCfg.delayMax;
            return this.getDateAddMinutes(video.statisticsUpdatedAt, delay);
        }

        const diffTrends = this.getDateDiffMinutes(video.trendsAt, video.statisticsUpdatedAt);
        if (diffTrends <= this.statisticsUpdateCfg.lowDealyAt) {
            return this.getDateAddMinutes(video.statisticsUpdatedAt, this.statisticsUpdateCfg.delayMax);
        }

        return null;
    }
}
