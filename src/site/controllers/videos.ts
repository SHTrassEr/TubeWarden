
import { Sequelize } from "sequelize-typescript";

import { Op } from "sequelize";
import { IIncludeOptions } from "sequelize-typescript/lib/interfaces/IIncludeOptions";

import { Request, Response } from "express";
import DateRange from "../../core/entity/DateRange";
import SummaryService from "../../core/service/summaryService";
import { SummaryKey } from "../../core/service/summaryService";
import StemmedWord from "../../models/db/stemmedWord";
import Video from "../../models/db/video";
import VideoViolationDislike from "../../models/db/videoViolationDislike";
import VideoViolationLike from "../../models/db/videoViolationLike";

import * as moment from "moment";

import createPager from "../../utils/pager";
import stemString from "../../utils/stemmer";

const summaryService = new SummaryService();

const PAGE_SIZE = 30;

function createFilterList() {
    return [
        {
            title: "все",
            url: "/videos",
            summaryKey: SummaryKey.videoCount,
            where: { },
        },
        {
            title: "накрутка лайков",
            url: "/videos/like",
            summaryKey: SummaryKey.likeViolationCount,
            where: {violationIndexLike:  {[Op.gt]: 0}},
        },
        {
            title: "накрутка дизлайков",
            url: "/videos/dislike",
            summaryKey: SummaryKey.dislikeViolationCount,
            where: {violationIndexDislike:  {[Op.gt]: 0}},
        },
        {
            title: "накрутка лайков и дизлайков",
            url: "/videos/likedislike",
            summaryKey: SummaryKey.likeAndDislikeViolationCount,
            where: {[Op.and]: [
                {violationIndexLike:  {[Op.gt]: 0}},
                {violationIndexDislike:  {[Op.gt]: 0}},
            ]},
        },
        {
            title: "чудеса",
            url: "/videos/strange",
            summaryKey: SummaryKey.strangeViolationVideoCount,
            where: {[Op.or]: [
                {violationIndexLike:  {[Op.lt]: 0}},
                {violationIndexDislike:  {[Op.lt]: 0}},
            ]},
        },
    ];
}

function getSearchString(req: Request): string {
    return req.param("s", "");
}

function getDateRange(req: Request): DateRange {
    return new DateRange(req.param("start", ""), req.param("end", ""));
}

async function getVideoList(req: Request, res: Response, filterList, currentFilter) {

    const searchString = getSearchString(req);
    const dateRange = getDateRange(req);
    const includeKeyword = initKeywordFilter(searchString);

    let pager;
    if (!includeKeyword && dateRange.startDate == null && dateRange.endDate == null) {
        const videoCount = await summaryService.getValue(currentFilter.summaryKey);
        pager = createPager(videoCount, parseInt(req.params.pageNum, 10), PAGE_SIZE);
    } else {
        pager = {
            pageSize: 100,
            currentPage: 1,
            offset: null,
            nextPage: null,
            previousPage: null,
        };
    }

    const include: IIncludeOptions[] = [
    ];

    if (includeKeyword) {
        include.push(includeKeyword);
    }

    const where = currentFilter.where;

    if (dateRange.startDate != null) {
        where.trendsAt = {[Op.gt]: moment(dateRange.startDate).subtract(1, "d").toDate()};
    }

    if (dateRange.endDate != null) {
        if (!where.trendsAt) {
            where.trendsAt = {};
        }

        where.trendsAt[Op.lt] = moment(dateRange.endDate).add(1, "d").toDate();
    }

    const videoList = await Video.findAll({
        include,
        offset: pager.offset,
        limit: pager.pageSize,
        order: [
            ["createdAt", "DESC"],
        ],
        where,
    });

    res.render("videos", { videoList, pager, filterList, currentFilter, searchString, dateRange });
}

function initKeywordFilter(filter: string) {
    if (!filter) {
        return null;
    }

    const sw = stemString(filter);

    if (sw.length === 0) {
        return null;
    }

    const include = {
        attributes: [],
        model: StemmedWord,
        duplicating: false,
        requred: true,
        where: {title: sw[0]},
        include: [],
    };

    let lastInclude = include;
    const wordCnt = Math.min(sw.length, 5);
    for (let i = 1; i < wordCnt; i++) {

        lastInclude.include.push({
            attributes: [],
            model: Video,
            requred: true,
            duplicating: false,
            where: { videoId: {[Op.eq]: Sequelize.literal("`Video`.`videoId`")} },
            include: [{
                attributes: [],
                model: StemmedWord,
                duplicating: false,
                requred: true,
                where: {title: sw[i]},
                include: [],
            }],
        });

        lastInclude = lastInclude.include[0].include[0];
    }

    return include;
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
