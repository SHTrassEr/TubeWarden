import Statistics  from "../../models/Statistics";
import Video   from "../../models/Video";

import GoogleVideoService from "../../google/googleVideoService";
import ViolationService from "./violationService";



import { Promise } from "bluebird";

export default class StatisticsGrabberService {

    googleVideoService = new GoogleVideoService();
    violationService = new ViolationService();
    auth;
    statisticsUpdateCfg;

    constructor(auth: any, statisticsUpdateCfg: any) {
        this.auth = auth;
        this.statisticsUpdateCfg = statisticsUpdateCfg;
    }

    update(videoIdList: string[]): Promise {
        return this.googleVideoService.getStatistics(this.auth, videoIdList)
        .then((data) => {
            return Promise.each(data.items, this.updateStatistics.bind(this));
        });
    }

    createStatisticsByResult(result: any): any {
        let date: Date = new Date();
        return {
            videoId: result.id,
            viewCount: result.statistics.viewCount,
            likeCount: result.statistics.likeCount,
            dislikeCount: result.statistics.dislikeCount,
            commentCount: result.statistics.commentCount,
            createdAt: date,
            updatedAt: date,
        };
    }

    isStatisticsAtLine(statisticsList: Statistics[]): boolean {
        return this.violationService.isStatisticsAtLine(statisticsList, "likeCount")
            && this.violationService.isStatisticsAtLine(statisticsList, "dislikeCount")
            && this.violationService.isStatisticsAtLine(statisticsList, "viewCount", 1);
    }

    updateStatistics(result: any): Promise {

        var reqiredItemCnt: number = this.violationService.getRequredItemCnt() - 1;

        return Statistics.findAll({
            where: { videoId: result.id },
            order: [
                ["createdAt", "DESC"]
            ],
            limit: reqiredItemCnt
        }).then(statisticsList => {
            var stl: any = this.createStatisticsByResult(result);

            if(statisticsList.length === reqiredItemCnt) {
                var stm: Statistics = statisticsList[0];
                statisticsList.reverse();
                statisticsList.push(stl);
                if (this.isStatisticsAtLine(statisticsList)) {
                    return stm.update(stl);
                }
            }

            return Statistics.create(stl);
        }).then(() => {
            return this.updateVideoById(result.id);
        });
    }

    updateVideoById(videoId: string): Promise {
        return Video.findOne({
            where: {
                videoId: videoId
            }
        })
        .then(video => this.updateVideo(video));
    }

    updateVideo(video: Video): any {
        if (video != null) {
            return Statistics.findAll({
                where: { videoId: video.videoId },
                order: [
                    ["createdAt", "DESC"]
                ],
                limit: this.violationService.getRequredItemCnt()
            })
            .then(statisticsList => {

                video.statisticsUpdatedAt = new Date();

                statisticsList.reverse();
                var violated: boolean = false;

                if(this.violationService.check(statisticsList, "likeCount")) {
                    video.likeViolationCnt ++;
                    violated = true;
                }

                if(this.violationService.check(statisticsList, "dislikeCount")) {
                    video.dislikeViolationCnt ++;
                    violated = true;
                }

                if(violated) {
                    video.lastViolationAt = new Date();
                }

                video.nextStatisticsUpdateAt = this.getNextUpdateTime(video);
                return video.save();
            });
        }
    }

    getDateDiffMinutes(dateStart: Date, dateEnd: Date): number {
        return (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60);
    }

    getDateAddMinutes(date: Date, min: number): Date {
        return new Date(date.getTime() + min * 60 * 1000);
    }


    getNextUpdateTime(video: Video): Date {
        var lastViolationAt: Date = video.createdAt;
        if(video.lastViolationAt) {
            lastViolationAt = video.lastViolationAt;
        }

        var diff: number = this.getDateDiffMinutes(lastViolationAt, video.statisticsUpdatedAt);

        if(diff <= this.statisticsUpdateCfg.lowDealyAt) {
            return this.getDateAddMinutes(video.statisticsUpdatedAt, this.statisticsUpdateCfg.delayMin);
        }

        if(diff > this.statisticsUpdateCfg.lowDealyAt && diff <= this.statisticsUpdateCfg.endAt) {
            var c: number = ((diff - this.statisticsUpdateCfg.lowDealyAt) /
                (this.statisticsUpdateCfg.endAt - this.statisticsUpdateCfg.lowDealyAt));
            var delay: number =  (1- c) * this.statisticsUpdateCfg.delayMin + c * this.statisticsUpdateCfg.delayMax;
            return this.getDateAddMinutes(video.statisticsUpdatedAt, delay);
        }

        return null;
    }
}