import { Request, Response } from "express";
import { Op } from "sequelize";
import Video from "../../models/Video";


export let getAllVideo:(req: Request, res: Response) => any  = (req: Request, res: Response) => {
    Video.findAll({
        where: {
        },
        order: [
            ["createdAt", "DESC"]
        ],
        limit: 50
    })
    .then((videoList) => {
        res.render("all", { title: "TubeWarden", videoList: videoList });
    });
};