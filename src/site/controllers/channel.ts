import { Request, Response } from "express";
import Channel from "../../models/db/channel";
import Video from "../../models/db/video";

export async function getChannel(req: Request, res: Response) {

    const channel = await Channel.findOne({
        include: [Video],
        where: {
            id: req.params.channelId,
        },
    });

    res.render("channel", { channel });
}
