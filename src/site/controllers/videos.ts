import { Request, Response } from "express";
import { Op } from "sequelize";
import SummaryService from "../../core/service/summaryService";
import Video from "../../models/db/video";

const summaryService = new SummaryService();

const PAGE_SIZE = 30;

function createPager(totalCount: number, currentPage: number, pageSize: number) {
    const totalFullPageCount = Math.floor(totalCount / pageSize);
    const totalPageCount = Math.ceil(totalCount / pageSize);

    let offset = 0;

    if (currentPage && currentPage > 0 && currentPage < totalPageCount) {
        offset = Math.max(totalCount - currentPage * pageSize, 0);
    } else {
        currentPage = totalPageCount;
    }

    return {
        currentPage,
        offset,
        nextPage: (currentPage > 1) ? (currentPage - 1) : null,
        previousPage: (currentPage < totalPageCount) ? (currentPage + 1) : null,
    };
}

export async function getAllVideo(req: Request, res: Response) {

    const videoCount = await summaryService.getVideoCount();

    const pager = createPager(videoCount, parseInt(req.params.pageNum, 10), PAGE_SIZE);

    const videoList = await Video.findAll({
        offset: pager.offset,
        limit: PAGE_SIZE,
        order: [
            ["createdAt", "DESC"],
        ],
        where: {
        },
    });

    res.render("videos", { videoList, pager });
}
