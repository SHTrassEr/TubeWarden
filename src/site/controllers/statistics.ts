import { Request, Response } from "express";
import Video from "../../models/Video";

export let getVideo: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Video.findOne({
        where: {
            videoId: req.params.videoId
        }
    })
    .then((video) => {
        res.render("statistics", {
            title: video.title,
            videoId: req.params.videoId });
    });
};
