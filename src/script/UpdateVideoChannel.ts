import { Op } from "sequelize";
import Config from "../config";
import ChannelGrabber from "../core/grabber/channelGrabber";
import VideoService from "../core/service/videoService";
import Video from "../models/db/video";
import sequelize from "../sequelize";

import GoogleVideoService from "../core/service/googleVideoService";

const googleVideoService = new GoogleVideoService(Config.Google.key);
const videoService = new VideoService(googleVideoService);
const channelGrabber = new ChannelGrabber(googleVideoService);

async function process(): Promise<any> {
    let videoList: Video[];

    do {
        videoList = await Video.findAll({
            limit: Config.Google.maxResults,
            where: {
                deleted: false,
                channelId: null,
        }});

        if (videoList.length > 0) {
            await videoService.updateList(videoList);
        }

    }while (videoList.length > 0);

    let cnt = 0;

    do {
        cnt = await channelGrabber.processEmptyTitle(Config.Google.maxResults);
    } while (cnt > 0);
}

sequelize.authenticate()
.then(() => {
    return process();
})
.then(() => {
    sequelize.close();
});
