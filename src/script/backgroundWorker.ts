import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import ChannelGrabber from "../core/grabber/channelGrabber";
import StatisticsGrabber from "../core/grabber/statisticsGrabber";
import TrendsGrabber from "../core/grabber/trendsGrabber";
import GoogleVideoService from "../core/service/googleVideoService";

import SummaryService from "../core/service/summaryService";

const summaryService = new SummaryService();

const googleVideoService = new GoogleVideoService(Config.Google.key);

const trendsGrabberService
    = new TrendsGrabber(googleVideoService, Config.Google.regionCode);

const statisticsGrabberService
    = new StatisticsGrabber(googleVideoService, Config.Service.statistics.update);

const channelGrabber
    = new ChannelGrabber(googleVideoService);

sequelize.authenticate()
    .then(() => {
         schedule.scheduleJob(Config.Service.trends.cron, async () => {
            const videoList = await trendsGrabberService.process(Config.Google.maxResults);
            await channelGrabber.processEmptyTitle(Config.Google.maxResults);
            await summaryService.updateAll();
         });

         schedule.scheduleJob(Config.Service.statistics.cron, async () => {
            await statisticsGrabberService.process(Config.Google.maxResults);
        });
    });
