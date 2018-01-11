import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import TrendsGrabber from "../core/grabber/trendsGrabber";

import GoogleVideoService from "../core/service/googleVideoService";

const googleVideoService = new GoogleVideoService(Config.Google.key);

const trendsGrabberService
    = new TrendsGrabber(googleVideoService, Config.Google.regionCode);

sequelize.authenticate()
    .then(() => {
         schedule.scheduleJob(Config.Service.trends.cron, async () => {
            await trendsGrabberService.process(Config.Google.maxResults);
         });
    });
