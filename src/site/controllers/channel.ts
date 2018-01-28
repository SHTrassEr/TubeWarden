import { Request, Response } from "express";
import Channel from "../../models/db/channel";
import Video from "../../models/db/video";
import VideoViolationDislike from "../../models/db/videoViolationDislike";
import VideoViolationLike from "../../models/db/videoViolationLike";

export async function getChannel(req: Request, res: Response) {

    const channel = await Channel.findOne({
        where: {
            id: req.params.channelId,
        },
    });

    const videoList = await Video.findAll({
        order: [
            ["createdAt", "DESC"],
        ],
        where: {
            channelId: req.params.channelId,
        },
    });

    res.render("channel", { channel, videoList });
}
