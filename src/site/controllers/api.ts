import { Request, Response } from "express";
import { Op } from "sequelize";
import Statistics from "../../models/db/Statistics";
import Video from "../../models/db/Video";

export let getVideoList: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Video.findAll({ limit: 50 })
    .then((videoList) => {
        res.json(videoList);
    });
};

export let getStatisticsByVideo: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Statistics.findAll({
        where: {
            videoId: req.params.videoId,
        },
    })
    .then((statisticsList) => {
        res.json(statisticsList);
    });
};

export let getTrendsVideoList: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Video.findAll({
        limit: 150 ,
        order: [
            ["trendsAt", "DESC"],
        ],
    })
    .then((videoList) => {
        res.json(videoList);
    });
};
