import { Request, Response } from "express";
import Channel from "../../models/db/channel";
import Tag from "../../models/db/tag";
import Video from "../../models/db/video";

export async function getVideo(req: Request, res: Response) {
    const video = await Video.findOne({
        include: [Channel, Tag],
        where: {
            videoId: req.params.videoId,
        },
    });

    res.render("video", { video });
}
