import { Promise } from "bluebird";

import  GoogleVideoService from "../../google/googleVideoService";
import Video from "../../models/db/Video";

export default class TrendsGrabberService {

    googleVideoService = new GoogleVideoService();
    auth;
    regionCode: string;
    maxResults: number;

    constructor(auth: any, regionCode: string, maxResults: number) {
        this.auth = auth;
        this.regionCode = regionCode;
        this.maxResults = maxResults;
    }


    update(): Promise {
        return this.googleVideoService.getMostPopular(this.auth, this.regionCode, this.maxResults)
            .then((data) => {
                var newVideoList: string[] = [];
                Promise.each(data.items, r => this.checkVideo(r, newVideoList))
                    .then(() => {
                        if(newVideoList.length > 0) {
                            return this.updateVideoList(newVideoList);
                        }
                    });
            });
    }

    updateVideoList(videoList: string[]): Promise {
        return this.googleVideoService.getInfo(this.auth, videoList)
            .then((data) => {
                return Promise.each(data.items, r => this.updateVideo(r));
            });
    }

    checkVideo(result: any, newVideoList: string[]): Promise {
        return Video.findOne({where: {videoId: result.id}})
            .then(v => {
                if(!v) {
                    newVideoList.push(result.id);
                } else {
                    v.trendsAt = new Date();
                    v.deleted = false;
                    v.deletedAt = null;
                    return v.save();
                }
            });
    }

    updateVideo(result: any):Promise {
        Video.findOne({where: {videoId: result.id}})
            .then(v => {
                if(!v) {
                    var date: Date = new Date();
                    return Video.create({
                        videoId: result.id,
                        title: result.snippet.title,
                        publishedAt: result.snippet.publishedAt,
                        nextStatisticsUpdateAt: date,
                        trendsAt: date
                    });
                }
            });
    }
}
