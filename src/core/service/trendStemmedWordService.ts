import StemmedWord from "../../models/db/stemmedWord";
import Tag from "../../models/db/tag";
import TrendStemmedWord from "../../models/db/trendStemmedWord";
import Video from "../../models/db/video";
import Word from "../../models/db/word";

export default class TrendStemmedWordService {

    public async addVideoTrendsWordList(video: Video, date: Date): Promise<Video> {
        const stemmedWordIdList = video.stemmedWords.map((w) => w.id);
        const d = this.getDate(date);
        await this.getOrCreateTrendWordList(stemmedWordIdList, d);
        await TrendStemmedWord.update({
            videoCount: Word.sequelize.literal("videoCount + 1"),
            videoDelta: Word.sequelize.literal("videoDelta + 1"),
        }, { where: { stemmedWordId: stemmedWordIdList, date: d} });

        return video;
    }

    public async removeVideoTrendsWordList(video: Video, date: Date): Promise<Video> {
        const stemmedWordIdList = video.stemmedWords.map((w) => w.id);
        const d = this.getDate(date);
        await this.getOrCreateTrendWordList(stemmedWordIdList, d);
        await TrendStemmedWord.update({
            videoCount: Word.sequelize.literal("videoCount - 1"),
            videoDelta: Word.sequelize.literal("videoDelta - 1"),
        }, { where: { stemmedWordId: stemmedWordIdList, date: d} });

        return video;
    }

    protected getDate(date: Date): Date {
        const coeff = 1000 * 60 * 5;
        return new Date(Math.floor(date.getTime() / coeff) * coeff);
    }

    protected async getOrCreateTrendWordList(stemmedWordIdList: number[], date: Date): Promise<TrendStemmedWord[]> {
        const trendWordList = await TrendStemmedWord.findAll({where: { date, stemmedWordId: stemmedWordIdList }});
        if (trendWordList.length < stemmedWordIdList.length) {
            const idSet = new Set<number>(trendWordList.map((tw) => tw.stemmedWordId));
            const newWordIdList = stemmedWordIdList.filter((id) => !idSet.has(id));
            const newTrendWordList = await this.createTrendWordList(newWordIdList, date);
            for (const tw of newTrendWordList) {
                trendWordList.push(tw);
            }
        }

        return trendWordList;
    }

    protected async createTrendWordList(stemmedWordIdList: number[], date: Date): Promise<TrendStemmedWord[]> {
        const newTrendWordList: TrendStemmedWord[] = [];
        for (const stemmedWordId of stemmedWordIdList) {
            const trendWord = await this.createTrendWord(stemmedWordId, date);
            if (trendWord != null) {
                newTrendWordList.push(trendWord);
            }
        }

        return newTrendWordList;
    }

    protected async createTrendWord(stemmedWordId: number, date: Date): Promise<TrendStemmedWord> {
        const oldTrendWord = await TrendStemmedWord.findOne({where: {stemmedWordId}, order: [["date", "DESC"]] });
        if (oldTrendWord == null) {
            return await TrendStemmedWord.create({
                date,
                stemmedWordId,
            });
        }

        if (oldTrendWord.date === date) {
            return oldTrendWord;
        }

        if (oldTrendWord.date < date) {
            if (oldTrendWord.videoCount === 0 && oldTrendWord.videoDelta === 0) {
                oldTrendWord.date = date;
                await oldTrendWord.save();
                return oldTrendWord;
            }

            return await TrendStemmedWord.create({
                date,
                stemmedWordId,
                videoCount: oldTrendWord.videoCount,
            });
        }

        return null;
    }
}
