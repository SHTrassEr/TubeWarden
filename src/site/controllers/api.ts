import { Request, Response } from "express";
import { Op } from "sequelize";
import DateRange from "../../core/entity/DateRange";
import Statistics from "../../models/db/statistics";
import StemmedWord from "../../models/db/stemmedWord";
import Summary from "../../models/db/summary";
import TrendStemmedWord from "../../models/db/trendStemmedWord";
import Video from "../../models/db/video";
import { getWordList, stemWord } from "../../utils/stemmer";

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

function getTrendValue(videoCount: number, startDate: number,  endDate: number): number {
    const hours = (endDate - startDate) / (1000 * 60 * 60);
    return hours * videoCount;
}

function getPrevTrendVideoCount(trend: TrendStemmedWord) {
    return trend.videoCount - (trend.added - trend.removed);
}

function getNextTrend(trendStemmedWordList: TrendStemmedWord[], index: number, startDate: number,  endDate: number): [number, number] {
    let currentTrend = trendStemmedWordList[index];

    while (index < (trendStemmedWordList.length - 1) &&  currentTrend.date.getTime() <= startDate ) {
        currentTrend = trendStemmedWordList[++index];
    }

    if (currentTrend.date.getTime() <= startDate) {
        return [index, getTrendValue(currentTrend.videoCount, startDate, endDate)];
    }

    if (currentTrend.date.getTime() >= endDate) {
        const videoCount = getPrevTrendVideoCount(currentTrend);
        return [index, getTrendValue(videoCount, startDate, endDate)];
    }

    let value = 0;
    let prevStartDate = startDate;
    do {
        const prevTrendVideoCount = getPrevTrendVideoCount(currentTrend);
        value += getTrendValue(prevTrendVideoCount, prevStartDate,  Math.min(currentTrend.date.getTime(), endDate));
        prevStartDate = currentTrend.date.getTime();
        if (index < (trendStemmedWordList.length - 1)) {
            currentTrend = trendStemmedWordList[++index];
        }
    } while (index < (trendStemmedWordList.length - 1) && currentTrend.date.getTime() <= endDate);

    if (currentTrend.date.getTime() <= endDate) {
        value += getTrendValue(currentTrend.videoCount, currentTrend.date.getTime(), endDate);
    }

    return [index, value];
}

function createTrendsData(trendStemmedWordList: TrendStemmedWord[], interval: number, startDate: Date, endDate: Date): [number, number[]] {
    const result: number[] = [];
    let total = 0;
    if (trendStemmedWordList.length > 0) {
        let trendIndex = 0;
        let value = 0;
        for (let d = startDate.getTime() - interval; d < endDate.getTime(); d += interval) {
            [trendIndex, value] = getNextTrend(trendStemmedWordList, trendIndex, d, (d + interval));
            total += value;
            result.push(Math.floor(value));
        }
    }
    return [Math.floor(total), result];
}

const trendsInterval = 1000 * 60 * 60 * 24;

async function getWordTrends(stemmedWord: string, dateRange: DateRange) {
    const stemmedWordEntity = await StemmedWord.findOne({where: {title: stemmedWord}});
    if (stemmedWordEntity != null) {
        const trendStemmedWordList = await TrendStemmedWord.findAll({where: {stemmedWordId: stemmedWordEntity.id}, order: ["date"]});
        if (trendStemmedWordList.length === 0 && dateRange.startDate) {
            const last = await TrendStemmedWord.findOne(
                {where: {stemmedWordId: stemmedWordEntity.id, date: {[Op.lt]: dateRange.startDate}}, order: [["date", "DESC"]]});
            if (last != null) {
                trendStemmedWordList.push(last);
            }
        }

        const endDate = (dateRange.endDate && dateRange.endDate < new Date()) ? dateRange.endDate : new Date();
        const interval = trendsInterval;
        if (trendStemmedWordList.length > 0) {
            const startDate = dateRange.startDate ? dateRange.startDate : trendStemmedWordList[0].date;
            const [total, data] = createTrendsData(trendStemmedWordList, interval, startDate, endDate);
            return {startDate : new Date(startDate.getTime() - trendsInterval / 2), endDate, interval, total, data};
        }

        return {startDate: dateRange.startDate, endDate: dateRange.endDate, interval, data: []};
    }

    return [];
}

export async function getWordListTrends(req: Request, res: Response) {
    const wordList = getWordList(req.query.s);
    const resultList = [];
    if (wordList.length > 0) {
        const dateRange = new DateRange(req.query.start, req.query.end);
        for (const word of wordList) {
            const stemmedWord = stemWord(word);
            if (stemmedWord) {
                const trends = await getWordTrends(stemmedWord, dateRange);
                const result = {
                    word,
                    trends,
                };

                resultList.push(result);
            }
        }
    }
    res.json(resultList);
}
