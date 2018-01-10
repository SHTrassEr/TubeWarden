import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Channel from "../../models/db/channel";
import Statistics from "../../models/db/statistics";
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
