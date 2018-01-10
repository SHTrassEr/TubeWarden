import { Op } from "sequelize";

import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import StatisticsGrabber from "../core/grabber/statisticsGrabber";
import Video from "../models/db/video";

const statisticsGrabberService
    = new StatisticsGrabber(Config.Google.key, Config.Service.statistics.update);

sequelize.authenticate()
    .then(() => {
        schedule.scheduleJob(Config.Service.statistics.cron, async () => {
            await statisticsGrabberService.process(Config.Google.maxResults);
        });
    });
