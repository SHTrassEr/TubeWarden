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

function createFilterList() {
    return [
        {
            title: "все",
            url: "/videos/",
            getVideoCount: summaryService.getVideoCount.bind(summaryService),
            where: {},
        },
        {
            title: "накрутка лайков",
            url: "/videos/like/",
            getVideoCount: summaryService.getLikeViolationVideoCount.bind(summaryService),
            where: {  likeViolationCnt: {[Op.gt]: 0}, dislikeViolationCnt: 0 },
        },
        {
            title: "накрутка дизлайков",
            url: "/videos/dislike/",
            getVideoCount: summaryService.getDislikeViolationVideoCount.bind(summaryService),
            where: {  dislikeViolationCnt: {[Op.gt]: 0}, likeViolationCnt: 0 },
        },
        {
            title: "накрутка лайков и дизлайков",
            url: "/videos/likedislike/",
            getVideoCount: summaryService.getLikeAndDislikeViolationVideoCount.bind(summaryService),
            where: {  likeViolationCnt: {[Op.gt]: 0}, dislikeViolationCnt: {[Op.gt]: 0}},
        },
        {
            title: "чудеса",
            url: "/videos/strange/",
            getVideoCount: summaryService.getLikeAndDislikeViolationVideoCount.bind(summaryService),
            where: { [Op.or]: [{likeStrangeCnt: {[Op.gt]: 0}}, {dislikeStrangeCnt: {[Op.gt]: 0}}] },
        },
    ];
}

async function getVideoList(req: Request, res: Response, filterList, currentFilter) {
    const videoCount = await currentFilter.getVideoCount();
    const pager = createPager(videoCount, parseInt(req.params.pageNum, 10), PAGE_SIZE);
    const videoList = await Video.findAll({
        offset: pager.offset,
        limit: PAGE_SIZE,
        order: [
            ["createdAt", "DESC"],
        ],
        where: currentFilter.where,
    });

    res.render("videos", { videoList, pager, filterList, currentFilter });
}

export async function getAllVideo(req: Request, res: Response) {
    const filterList = createFilterList();
    const currentFilter = filterList[0];
    return getVideoList(req, res, filterList, currentFilter);
}

export async function getAllLikeViolationVideo(req: Request, res: Response) {
    const filterList = createFilterList();
    const currentFilter = filterList[1];
    return getVideoList(req, res, filterList, currentFilter);
}

export async function getAllDislikeViolationVideo(req: Request, res: Response) {
    const filterList = createFilterList();
    const currentFilter = filterList[2];
    return getVideoList(req, res, filterList, currentFilter);
}

export async function getAllLikeAndDislikeViolationVideo(req: Request, res: Response) {
    const filterList = createFilterList();
    const currentFilter = filterList[3];
    return getVideoList(req, res, filterList, currentFilter);
}

export async function getAllStrangeVideo(req: Request, res: Response) {
    const filterList = createFilterList();
    const currentFilter = filterList[4];
    return getVideoList(req, res, filterList, currentFilter);
}
