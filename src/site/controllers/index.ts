import { Request, Response } from "express";
import { Op } from "sequelize";
import Video from "../../models/db/Video";

export let index: (req: Request, res: Response) => any  = (req: Request, res: Response) => {
    Video.findAll({
        limit: 50,
        order: [
            ["lastViolationAt", "DESC"],
        ],
        where: {
            lastViolationAt: {
                [Op.ne]: null,
            },
        },
    })
    .then((videoList) => {
        const videoListLike: Video[] = [];
        const videoListDislike: Video[] = [];

        for (const video of videoList) {
            if (video.likeViolationCnt > 0) {
                videoListLike.push(video);
            }

            if (video.dislikeViolationCnt > 0) {
                videoListDislike.push(video);
            }
        }

        res.render("index", { videoListLike, videoListDislike });
    });
};
