import Video from "../models/db/Video";
import StatisticsGrabberService from "./service/statisticsGrabberService";

import { Op } from "sequelize";

export default class StatisticsUpdateWorker {

    protected statisticsGrabberService: StatisticsGrabberService;
    protected maxResults: number;

    constructor(auth: any, maxResults: number, statisticsUpdateCfg: any) {
        this.statisticsGrabberService = new StatisticsGrabberService(auth, statisticsUpdateCfg);
        this.maxResults = maxResults;
    }

    public async process(): Promise<any> {
        const videoList = await Video.findAll({
            limit: this.maxResults,
            where: {
                deleted: false,
                nextStatisticsUpdateAt: { [Op.lt]: new Date() },
        }});

        if (videoList != null && videoList.length > 0) {
            const idList = videoList.map((r) => r.videoId);
            return this.statisticsGrabberService.update(idList);
        }
    }
}
