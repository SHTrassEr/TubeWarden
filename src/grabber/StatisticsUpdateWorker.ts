import { Promise } from "bluebird";
import Video from "../models/db/Video";
import StatisticsGrabberService from "./service/statisticsGrabberService";
import { Op } from "sequelize";

export default class StatisticsUpdateWorker {

    statisticsGrabberService: StatisticsGrabberService;
    maxResults: number;


    constructor(auth: any, maxResults: number, statisticsUpdateCfg: any) {
        this.statisticsGrabberService = new StatisticsGrabberService(auth, statisticsUpdateCfg);
        this.maxResults = maxResults;
    }

    process(): Promise {
        return Video.findAll({
            limit: this.maxResults,
            where:{
                deleted: false,
                nextStatisticsUpdateAt: {
                    [Op.lt]: new Date()
                }
        }})
        .then((result) => {
            if(result != null && result.length > 0) {
                var idList: string[] = result.map(r => r.videoId);
                return this.statisticsGrabberService.update(idList);
            }
        });
    }
}
