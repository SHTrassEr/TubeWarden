import * as google from "googleapis";

import { GoogleResultItemList, GoogleVideoInfo } from "../models/google/ItemInfo";

const service: any = google.youtube("v3");

export default class GoogleVideoService {

    public getStatistics(auth: any, videoIdList: string[]): Promise<GoogleVideoInfo[]> {
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

    public getInfo(auth: any, videoIdList: string[]): Promise<GoogleVideoInfo[]> {
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth,
                part: "snippet",
                id: videoIdList.join(),
                fields: "items(id,snippet(channelId,publishedAt,title))",
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

    public getMostPopularVideoIdList(auth: any, regionCode: string, maxResults: number): Promise<string[]> {
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
