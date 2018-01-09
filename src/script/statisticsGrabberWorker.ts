import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import StatisticsUpdateWorker from "../grabber/StatisticsUpdateWorker";

const statisticsUpdateWorker
    = new StatisticsUpdateWorker(Config.Google.key, Config.Google.maxResults, Config.Service.statistics.update);

let isJobActive: boolean = false;
sequelize.authenticate()
    .then(() => {
        schedule.scheduleJob(Config.Service.statistics.cron, () => {
            if (!isJobActive) {
                isJobActive = true;
                statisticsUpdateWorker.process()
                    .then(() => {
                        isJobActive = false;
                    }) ;
            }
        });
    });
