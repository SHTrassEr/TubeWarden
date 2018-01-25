import { Op } from "sequelize";

import Channel from "../models/db/channel";
import Video from "../models/db/video";

import Config from "../config";
import ChannelGrabber from "../core/grabber/channelGrabber";
import VideoGrabber from "../core/grabber/videoGrabber";
import sequelize from "../sequelize";

import GoogleVideoService from "../core/service/googleVideoService";

import createPager from "../utils/pager";

const googleVideoService = new GoogleVideoService(Config.Google.key);
const videoGrabber = new VideoGrabber(googleVideoService);
const channelGrabber = new ChannelGrabber(googleVideoService);

async function process(): Promise<any> {

    const channelCnt = await Channel.count();
    const pageSize = 50;
    let currentPage = 1;

    do {
        const pager = createPager(channelCnt, currentPage, pageSize);
        const channelList = await Channel.findAll({
            offset: pager.offset,
            limit: pageSize,
            order: [
                ["createdAt", "DESC"],
            ],
        });

        await channelGrabber.update(channelList);
        currentPage = pager.previousPage;
    } while (currentPage);
}

sequelize.authenticate()
.then(() => {
    return process();
})
.then(() => {
    sequelize.close();
});
