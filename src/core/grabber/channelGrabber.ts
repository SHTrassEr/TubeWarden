import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Channel from "../../models/db/channel";
import ChannelService from "../service/channelService";
import GoogleVideoService from "../service/googleVideoService";

export default class ChannelGrabber {

    protected googleVideoService: GoogleVideoService;
    protected regionCode: string;
    protected channelService: ChannelService;

    constructor(googleVideoService: GoogleVideoService) {
        this.googleVideoService = googleVideoService;
        this.channelService = new ChannelService();
    }

    public async processEmptyTitle(maxResults: number): Promise<number> {
        const channelList = await Channel.findAll({
            limit: maxResults,
            where: {
                deleted: false,
                title: null,
        }});

        if (channelList.length > 0) {
            await this.update(channelList);
        }

        return channelList.length;
    }

    protected createChannelInfoHash(infoList: GoogleChannelInfo[]): Map<string, GoogleChannelInfo> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj);
        }, new Map<string, GoogleChannelInfo>());
    }

    protected async update(channelList: Channel[]) {
        const channelIdList = channelList.map((c) => c.id);
        const channelInfoList = await this.googleVideoService.getChannelInfo(channelIdList);
        const channelInfoHash = this.createChannelInfoHash(channelInfoList);
        for (const channel of channelList) {
            if (channelInfoHash.has(channel.id)) {
                await this.channelService.updateChannel(channel, channelInfoHash.get(channel.id));
            }
        }

        if (channelIdList.length !== channelInfoHash.size) {
            const deletedChannelIdList = channelIdList.filter((channelId) => !channelInfoHash.has(channelId));
            await this.channelService.setDeletedChannelList(deletedChannelIdList);
        }
    }
}
