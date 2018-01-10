import { Request, Response } from "express";
import Channel from "../../models/db/channel";
import Video from "../../models/db/video";

export async function getVideo(req: Request, res: Response) {
    const video = await Video.findOne({
        include: [Channel],
        where: {
            videoId: req.params.videoId,
        },
    });

    res.render("statistics", { video });
}
