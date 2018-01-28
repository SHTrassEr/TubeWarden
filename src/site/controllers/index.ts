import { Request, Response } from "express";
import { Op } from "sequelize";
import SummaryService from "../../core/service/summaryService";
import { SummaryKey } from "../../core/service/summaryService";
import Video from "../../models/db/video";
import VideoViolationDislike from "../../models/db/videoViolationDislike";
import VideoViolationLike from "../../models/db/videoViolationLike";

const summaryService = new SummaryService();

export async function index(req: Request, res: Response) {
    const videoListLike = await Video.findAll({
        limit: 50,
        order: [
            ["createdAt", "DESC"],
        ],
        where: {violationIndexLike: {[Op.gt]: 0}},
    });

    const videoListDislike = await Video.findAll({
        limit: 50,
        order: [
            ["createdAt", "DESC"],
        ],
        where: {violationIndexDislike: {[Op.gt]: 0}},
    });

    const totalVideoCount = await summaryService.getValue(SummaryKey.videoCount);
    const totalViolationCount = await summaryService.getValue(SummaryKey.violationVideoCount);

    res.render("index", { videoListLike, videoListDislike, totalVideoCount, totalViolationCount });

}
