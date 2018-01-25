import { Request, Response } from "express";
import { Op } from "sequelize";
import SummaryService from "../../core/service/summaryService";
import StemmedWord from "../../models/db/stemmedWord";
import Video from "../../models/db/video";

import createPager from "../../utils/pager";
import stemString from "../../utils/stemmer";

const summaryService = new SummaryService();

const PAGE_SIZE = 30;

function createFilterList() {
    return [
        {
            title: "все",
            url: "/videos",
            getVideoCount: summaryService.getVideoCount.bind(summaryService),
            where: null,
        },
        {
            title: "накрутка лайков",
            url: "/videos/like",
            getVideoCount: summaryService.getLikeViolationVideoCount.bind(summaryService),
            where: {  likeViolationCnt: {[Op.gt]: 0}, dislikeViolationCnt: 0 },
        },
        {
            title: "накрутка дизлайков",
            url: "/videos/dislike",
            getVideoCount: summaryService.getDislikeViolationVideoCount.bind(summaryService),
            where: {  dislikeViolationCnt: {[Op.gt]: 0}, likeViolationCnt: 0 },
        },
        {
            title: "накрутка лайков и дизлайков",
            url: "/videos/likedislike",
            getVideoCount: summaryService.getLikeAndDislikeViolationVideoCount.bind(summaryService),
            where: {  likeViolationCnt: {[Op.gt]: 0}, dislikeViolationCnt: {[Op.gt]: 0}},
        },
        {
            title: "чудеса",
            url: "/videos/strange",
            getVideoCount: summaryService.getLikeAndDislikeViolationVideoCount.bind(summaryService),
            where: { [Op.or]: [{likeStrangeCnt: {[Op.gt]: 0}}, {dislikeStrangeCnt: {[Op.gt]: 0}}] },
        },
    ];
}

async function getVideoList(req: Request, res: Response, filterList, currentFilter) {
    const videoCount = await currentFilter.getVideoCount();

    const searchString = req.param("s", "");
    const include = initKeywordFilter(searchString);

    let pager;
    if (!include) {
        pager = createPager(videoCount, parseInt(req.params.pageNum, 10), PAGE_SIZE);
    } else {
        pager = {
            pageSize: null,
            currentPage: 1,
            offset: null,
            nextPage: null,
            previousPage: null,
        };
    }

    const videoList = await Video.findAll({
        include,
        offset: pager.offset,
        limit: pager.pageSize,
        order: [
            ["createdAt", "DESC"],
        ],
        where: currentFilter.where,
    });

    res.render("videos", { videoList, pager, filterList, currentFilter, searchString });
}

function initKeywordFilter(filter: string) {
    if (!filter) {
        return null;
    }

    const sw = stemString(filter);

    if (sw.length === 0) {
        return null;
    }

    const where = {title: sw};
    return [{
        model: StemmedWord,
        where,
    }];
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
