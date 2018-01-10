import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import TrendsGrabber from "../core/grabber/trendsGrabber";

const trendsGrabberService
    = new TrendsGrabber(Config.Google.key, Config.Google.regionCode);

sequelize.authenticate()
    .then(() => {
         schedule.scheduleJob(Config.Service.trends.cron, async () => {
            await trendsGrabberService.process(Config.Google.maxResults);
         });
    });
