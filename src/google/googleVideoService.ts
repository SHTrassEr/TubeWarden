import { Promise } from "bluebird";
import * as google from "googleapis";

var service: any = google.youtube("v3");

export default class GoogleVideoService {

    public getStatistics(auth: any, videoIdList: string[]): Promise {
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth: auth,
                part: "statistics",
                id: videoIdList.join(),
                fields: "items(id,statistics)"
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public getInfo(auth: any, videoIdList: string[]): Promise {
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth: auth,
                part: "snippet",
                id: videoIdList.join(),
                fields: "items(id,snippet(publishedAt,title))"
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public getMostPopular(auth: any, regionCode: string, maxResults: number): Promise {
        return new Promise((resolve, reject) => {
            service.videos.list({
                auth: auth,
                part: "snippet",
                regionCode: regionCode,
                maxResults: maxResults,
                chart: "mostPopular",
                fields: "items(id)"
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}
