import { Request, Response } from "express";
import Video from "../../models/Video";
import Statistics from "../../models/Statistics";


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

