import { Request, Response } from "express";
import { Op } from "sequelize";
import Video from "../../models/db/Video";


export let index:(req: Request, res: Response) => any  = (req: Request, res: Response) => {
    Video.findAll({
        where: {
            lastViolationAt: {
                [Op.ne]: null
            }
        },
        order: [
            ["trendsAt", "DESC"]
        ],
        limit: 50
    })
    .then((videoList) => {
        var videoListLike: Video[] = [];
        var videoListDislike: Video[] = [];

        for (var video of videoList) {
            if(video.likeViolationCnt > 0) {
                videoListLike.push(video);
            }

            if(video.dislikeViolationCnt > 0) {
                videoListDislike.push(video);
            }
        }

        res.render("index", { title: "TubeWarden", videoListLike: videoListLike, videoListDislike: videoListDislike });
    });
};