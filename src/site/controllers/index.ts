import { Request, Response } from "express";
import { Op } from "sequelize";
import SummaryService from "../../core/service/summaryService";
import Video from "../../models/db/video";

const summaryService = new SummaryService();

export async function index(req: Request, res: Response) {
    const videoList = await Video.findAll({
        limit: 50,
        order: [
            ["lastViolationAt", "DESC"],
        ],
        where: {
            lastViolationAt: {
                [Op.ne]: null,
            },
        },
    });

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

    const totalVideoCount = await summaryService.getVideoCount();
    const totalViolationCount = await summaryService.getViolationCount();

    res.render("index", { videoListLike, videoListDislike, totalVideoCount, totalViolationCount });

}
