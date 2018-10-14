import { AxiosResponse } from "axios";
import { google, youtube_v3 } from "googleapis";
import { GoogleChannelInfo, GoogleResultItemList, GoogleVideoInfo } from "../../models/google/itemInfo";

const service: youtube_v3.Youtube = google.youtube("v3");

export default class GoogleVideoService {

    protected auth;

    constructor(auth: any) {
        this.auth = auth;
    }

    public getVideoStatistics(videoIdList: string[]): Promise<youtube_v3.Schema$Video[]> {
        const param: any = {
            auth: this.auth,
            part: "statistics",
            id: videoIdList.join(),
            fields: "items(id,statistics)",
        };

        return new Promise((resolve, reject) => {
            service.videos.list(param, (err, response: AxiosResponse<youtube_v3.Schema$VideoListResponse>) => {
                if (err) {
                    reject(err);
                } else {
                    if (response.data.items) {
                        resolve(response.data.items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    public getVideoInfo(videoIdList: string[]): Promise<youtube_v3.Schema$Video[]> {
        const param: any  = {
            auth: this.auth,
            part: "snippet",
            id: videoIdList.join(),
            fields: "items(id,snippet(tags,channelId,publishedAt,title))",
        };
        return new Promise((resolve, reject) => {
            service.videos.list(param, (err, response: AxiosResponse<youtube_v3.Schema$VideoListResponse>) => {
                if (err) {
                    reject(err);
                } else {
                    if (response.data.items) {
                        resolve(response.data.items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    public getChannelInfo(channelIdList: string[]): Promise<youtube_v3.Schema$ChannelListResponse[]> {
        const param: any  = {
            auth: this.auth,
            part: "snippet,statistics",
            id: channelIdList.join(),
            fields: "items(id,snippet(thumbnails/default,title),statistics(subscriberCount,videoCount))",
        };
        return new Promise((resolve, reject) => {
            service.channels.list(param, (err, response: AxiosResponse<youtube_v3.Schema$ChannelListResponse>) => {
                if (err) {
                    reject(err);
                } else {
                    if (response.data.items) {
                        resolve(response.data.items);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    public getMostPopularVideoId(regionCode: string, maxResults: number): Promise<string[]> {
        const param: any  = {
            auth: this.auth,
            regionCode,
            maxResults,
            part: "snippet",
            chart: "mostPopular",
            fields: "items(id)",
        };

        return new Promise((resolve, reject) => {
            service.videos.list(param, (err, response: AxiosResponse<youtube_v3.Schema$VideoListResponse>) => {
                if (err) {
                    reject(err);
                } else {
                    if (response.data.items) {
                        resolve(response.data.items.map((d) => d.id ));
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }
}
