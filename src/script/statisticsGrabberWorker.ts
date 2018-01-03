import sequelize from "../sequelize";
import * as schedule from "node-schedule";
import Config from "../config";
import StatisticsUpdateWorker from "../grabber/StatisticsUpdateWorker";

var statisticsUpdateWorker: StatisticsUpdateWorker
    = new StatisticsUpdateWorker(Config.Google.key, Config.Google.maxResults, Config.Service.statistics.update);

var isJobActive: boolean = false;
sequelize.authenticate()
    .then(() => {
        schedule.scheduleJob(Config.Service.statistics.cron, () => {
            if(!isJobActive) {
                isJobActive = true;
                statisticsUpdateWorker.process()
                    .then(() => {
                        isJobActive = false;
                    });
            }

        });
    });