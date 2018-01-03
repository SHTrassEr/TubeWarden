import sequelize from "../sequelize";
import * as schedule from "node-schedule";
import Config from "../config";
import TrendsGrabberService from "../grabber/service/trendsGrabberService";

var trendsGrabberService: TrendsGrabberService
    = new TrendsGrabberService(Config.Google.key, Config.Google.regionCode, Config.Google.maxResults);

sequelize.authenticate()
    .then(() => {
        schedule.scheduleJob(Config.Service.trends.cron, () => {
            trendsGrabberService.update();
        });
    });