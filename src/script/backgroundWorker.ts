import * as schedule from "node-schedule";
import sequelize from "../sequelize";

import Config from "../config";
import ChannelGrabber from "../core/grabber/channelGrabber";
import StatisticsGrabber from "../core/grabber/statisticsGrabber";
import TrendsGrabber from "../core/grabber/trendsGrabber";
import GoogleVideoService from "../core/service/googleVideoService";

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
            const channelIdList = videoList.filter((v) => v.channelId).map((v) => v.channelId);
            if (channelIdList.length > 0) {
                await channelGrabber.processEmptyTitle(Config.Google.maxResults, channelIdList);
            }
         });

         schedule.scheduleJob(Config.Service.statistics.cron, async () => {
            await statisticsGrabberService.process(Config.Google.maxResults);
        });
    });
