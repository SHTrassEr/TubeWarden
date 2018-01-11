import { Op } from "sequelize";
import Config from "../config";
import ChannelGrabber from "../core/grabber/channelGrabber";
import VideoGrabber from "../core/grabber/videoGrabber";
import Video from "../models/db/video";
import sequelize from "../sequelize";

import GoogleVideoService from "../core/service/googleVideoService";

const googleVideoService = new GoogleVideoService(Config.Google.key);
const videoGrabber = new VideoGrabber(googleVideoService);
const channelGrabber = new ChannelGrabber(googleVideoService);

async function process(): Promise<any> {
    let cnt = 0;

    do {
        cnt = await videoGrabber.processEmptyChannelId(Config.Google.maxResults);
    } while (cnt > 0);

    cnt = 0;

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
