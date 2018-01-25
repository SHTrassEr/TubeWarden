import { IFindOptions } from "sequelize-typescript/lib/interfaces/IFindOptions";
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

    public async processEmptyTitle(maxResults: number, channelIdList?: string[] ): Promise<number> {
        const findOptions: IFindOptions<Channel> = {
            limit: maxResults,
            where: {
                deleted: false,
                title: null,
        }};

        if (channelIdList) {
            (findOptions as any).where.id = channelIdList;
        }

        const channelList = await Channel.findAll(findOptions);

        if (channelList.length > 0) {
            await this.update(channelList);
        }

        return channelList.length;
    }

    public async update(channelList: Channel[]) {
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

    protected createChannelInfoHash(infoList: GoogleChannelInfo[]): Map<string, GoogleChannelInfo> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj);
        }, new Map<string, GoogleChannelInfo>());
    }

}
