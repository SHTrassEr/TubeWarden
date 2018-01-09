import { Request, Response } from "express";
import { Op } from "sequelize";
import Video from "../../models/db/Video";

export let getAllVideo: (req: Request, res: Response) => any  = (req: Request, res: Response) => {
    Video.findAll({
        limit: 500,
        order: [
            ["trendsAt", "DESC"],
        ],
        where: {
        },
    })
    .then((videoList) => {
        res.render("all", { title: "TubeWarden", videoList });
    });
};
