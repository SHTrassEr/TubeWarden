import { Request, Response } from "express";
import { Op } from "sequelize";
import Statistics from "../../models/db/statistics";
import Summary from "../../models/db/summary";
import Video from "../../models/db/video";
import Word from "../../models/db/word";

export async function getVideoList(req: Request, res: Response) {
    const videoList = await Video.findAll({ limit: 50 });
    res.json(videoList);
}

export async function getStatisticsByVideo(req: Request, res: Response) {
    const statisticsList = await Statistics.findAll({
        where: {
            videoId: req.params.videoId,
        },
    });

    res.json(statisticsList);
}

export async function getTrendsVideoList(req: Request, res: Response) {

    const videoList = await Video.findAll({
        attributes: ["videoId", "likeCount", "dislikeCount", "viewCount", "violationIndexLike", "violationIndexDislike"],
        limit: 80,
        order: [
            ["trendsAt", "DESC"],
        ],
    });

    const result = videoList.map((v) => ({
        videoId: v.videoId,
        likeCount: v.likeCount,
        dislikeCount: v.dislikeCount,
        viewCount: v.viewCount,
        likeViolationCnt: v.violationIndexLike,
        dislikeViolationCnt: v.violationIndexDislike,
    }));

    res.json(result);
}

export async function getSummaryList(req: Request, res: Response) {
    const summaryList = await Summary.findAll();
    res.json(summaryList);
}
