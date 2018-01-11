import { Op } from "sequelize";

import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import StatisticsGrabber from "../core/grabber/statisticsGrabber";
import Video from "../models/db/video";

import GoogleVideoService from "../core/service/googleVideoService";

const googleVideoService = new GoogleVideoService(Config.Google.key);

const statisticsGrabberService
    = new StatisticsGrabber(googleVideoService, Config.Service.statistics.update);

sequelize.authenticate()
    .then(() => {
        schedule.scheduleJob(Config.Service.statistics.cron, async () => {
            await statisticsGrabberService.process(Config.Google.maxResults);
        });
    });
