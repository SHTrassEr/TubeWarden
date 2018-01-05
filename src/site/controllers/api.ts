import { Request, Response } from "express";
import { Op } from "sequelize";
import Video from "../../models/db/Video";
import Statistics from "../../models/db/Statistics";


export let getVideoList: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Video.findAll({ limit: 50 })
    .then((videoList) => {
        res.json(videoList);
    });
};


export let getStatisticsByVideo: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Statistics.findAll({
        where: {
            videoId: req.params.videoId
        }
    })
    .then((statisticsList) => {
        res.json(statisticsList);
    });
};

export let getTrendsVideoList: (req: Request, res: Response) => any = (req: Request, res: Response) => {
    Video.findAll({
        limit: 100 ,
        order: [
            ["trendsAt", "DESC"]
        ]
    })
    .then((videoList) => {
        res.json(videoList);
    });
};