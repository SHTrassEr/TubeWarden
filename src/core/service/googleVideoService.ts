import * as google from "googleapis";

import { GoogleChannelInfo, GoogleResultItemList, GoogleVideoInfo } from "../../models/google/itemInfo";

const service: any = google.youtube("v3");

export default class GoogleVideoService {

    protected auth;

    constructor(auth: any) {
        this.auth = auth;
    }

    public getVideoStatistics(videoIdList: string[]): Promise<GoogleVideoInfo[]> {
        const auth = this.auth;
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth,
                part: "statistics",
                id: videoIdList.join(),
                fields: "items(id,statistics)",
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.items) {
                        resolve(data.items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    public getVideoInfo(videoIdList: string[]): Promise<GoogleVideoInfo[]> {
        const auth = this.auth;
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth,
                part: "snippet",
                id: videoIdList.join(),
                fields: "items(id,snippet(tags,channelId,publishedAt,title))",
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.items) {
                        resolve(data.items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    public getChannelInfo(channelIdList: string[]): Promise<GoogleChannelInfo[]> {
        const auth = this.auth;
        return new Promise((resolve, reject) => {
            service.channels.list({
                auth,
                part: "snippet",
                id: channelIdList.join(),
                fields: "items(id,snippet(title))",
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.items) {
                        resolve(data.items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    public getMostPopularVideoId(regionCode: string, maxResults: number): Promise<string[]> {
        const auth = this.auth;
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth,
                regionCode,
                maxResults,
                part: "snippet",
                chart: "mostPopular",
                fields: "items(id)",
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.items) {
                        resolve(data.items.map((d) => d.id ));
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }
}
