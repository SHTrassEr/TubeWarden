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

function getNextTrend(trendStemmedWordList: TrendStemmedWord[], index: number, date: number): [number, number] {
    let currentTrend = trendStemmedWordList[index];

    if (currentTrend.date.getTime() > date) {
        return [index, (currentTrend.videoCount - (currentTrend.added - currentTrend.removed))];
    }

    let i = index;
    let maxValue = currentTrend.videoCount;

    do {
        currentTrend = trendStemmedWordList[i++];
        if (maxValue < currentTrend.videoCount) {
            maxValue = currentTrend.videoCount;
        }
    }while (currentTrend.date.getTime() <= date && i < trendStemmedWordList.length);

    return [Math.min(i, trendStemmedWordList.length - 1), maxValue];
}

function createTrendsData(trendStemmedWordList: TrendStemmedWord[], interval: number, startDate: Date, endDate: Date): number[] {
    const result: number[] = [];
    if (trendStemmedWordList.length > 0) {
        let trendIndex = 0;
        let maxValue = 0;
        for (let d = startDate.getTime(); d <= endDate.getTime(); d += interval) {
            [trendIndex, maxValue] = getNextTrend(trendStemmedWordList, trendIndex, d);
            result.push(maxValue);
        }
    }
    return result;
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

        const startDate = dateRange.startDate ? dateRange.startDate : trendStemmedWordList[0].date;
        startDate.setHours(0, 0, 0, 0);
        const endDate = dateRange.endDate ? dateRange.endDate : new Date();
        startDate.setHours(23, 59, 59, 0);
        const interval = trendsInterval;
        const data = createTrendsData(trendStemmedWordList, interval, startDate, endDate);
        return {startDate, endDate, interval, data};
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
