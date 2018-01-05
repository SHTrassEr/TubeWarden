import { Request, Response } from "express";
import { Op } from "sequelize";
import Video from "../../models/db/Video";


export let getAllVideo:(req: Request, res: Response) => any  = (req: Request, res: Response) => {
    Video.findAll({
        where: {
        },
        order: [
            ["trendsAt", "DESC"]
        ],
        limit: 500
    })
    .then((videoList) => {
        res.render("all", { title: "TubeWarden", videoList: videoList });
    });
};