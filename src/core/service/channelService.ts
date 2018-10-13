import { Op } from "sequelize";
import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Channel from "../../models/db/channel";
import Statistics from "../../models/db/statistics";
import Video from "../../models/db/video";
import GoogleVideoService from "./googleVideoService";

export default class ChannelService {

    public async getOrCreateChannelById(id: string): Promise<Channel> {
        let channel = await Channel.findById(id);
        if (channel) {
            return channel;
        }

        channel = new Channel({ id });
        return channel.save();
    }

    public async updateChannel(channel: Channel, channelInfo: GoogleChannelInfo) {
        if (channelInfo.snippet.title) {
            channel.title = channelInfo.snippet.title;
        } else {
            channel.title = "";
        }

        if (channelInfo.statistics) {
            if (channelInfo.statistics.videoCount) {
                channel.videoCount = channelInfo.statistics.videoCount;
            }

            if (channelInfo.statistics.subscriberCount) {
                channel.subscriberCount = channelInfo.statistics.subscriberCount;
            }

            if (channelInfo.snippet.thumbnails && channelInfo.snippet.thumbnails.default) {
                channel.thumbnail = channelInfo.snippet.thumbnails.default.url;
            }
        }

        channel.trendsVideoCount = await Video.count({where: {channelId: channel.id}});
        channel.likeViolationCount = await Video.count({where: {channelId: channel.id, violationIndexLike: {[Op.gt]: 0}}});
        channel.dislikeViolationCount = await Video.count({where: {channelId: channel.id, violationIndexDislike: {[Op.gt]: 0}}});

        if (channel.changed()) {
            return channel.save();
        }
    }

    public async setDeletedChannelList(deletedChannelIdList: string[]) {
        if (deletedChannelIdList.length > 0) {
            return Channel.update({ deleted: true, deletedAt: new Date() }, {where: {id: deletedChannelIdList}});
        }
    }
}
