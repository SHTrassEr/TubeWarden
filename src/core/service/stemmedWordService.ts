import StemmedWord from "../../models/db/stemmedWord";
import Tag from "../../models/db/tag";
import Video from "../../models/db/video";
import Word from "../../models/db/word";

import { getWordList, stemWord } from "../../utils/stemmer";

export default class StemmedWordService {

    public async updateVideo(videoId: string) {
        const video = await Video.findByPrimary(videoId, {include: [Tag]});
        await this.setVideoStemmedWordList(video);
        await video.save();
    }

    public async setVideoStemmedWordList(video: Video) {

        const titleList = [video.title];
        if (video.tags.length > 0) {
            for (const tag of video.tags) {
                titleList.push(tag.title);
            }
        }

        const wordList = this.createWordList(titleList);
        const wordEntityList = await this.getOrCreateWordListByWords(wordList);
        await video.$set("words", wordEntityList);

        const stemmedWordIdList = this.createStemmedWordIdList(wordEntityList);
        await video.$set("stemmedWords", stemmedWordIdList);

        const wordIdList = wordEntityList.map((w) => w.id);
        if (wordIdList && wordIdList.length > 0) {
            await Word.update({ videoCount: Word.sequelize.literal("videoCount + 1") }, { where: { id: wordIdList} });
        }

        if (stemmedWordIdList && stemmedWordIdList.length > 0) {
            await StemmedWord.update({ videoCount: StemmedWord.sequelize.literal("videoCount + 1") }, { where: { id: stemmedWordIdList} });
        }
    }

    protected createStemmedWordIdList(wordEntityList: Word[]): number[] {
        const stemmedWordIdSet = new Set<number>();
        const stemmedWordEntityList = wordEntityList.map((w) => w.stemmedWordId)
            .filter((id) => {
                if (id >= 0 && !stemmedWordIdSet.has(id)) {
                    stemmedWordIdSet.add(id);
                    return true;
                }
                return false;
            });

        return stemmedWordEntityList;
    }

    protected createWordList(titleList: string[]): string[] {
        const wordTitleSet = new Set<string>();
        for (const title of titleList) {
            if (title) {
                const wordList = getWordList(title);
                this.addListToHash(wordList, wordTitleSet);
            }
        }

        return Array.from(wordTitleSet);
    }

    protected addListToHash(strList: string[], strHash: Set<string>) {
        for (const s of strList) {
            if (!strHash.has(s)) {
                strHash.add(s);
            }
        }
    }

    protected async getOrCreateWordListByWords(titleList: string[]): Promise<Word[]> {
        if (!titleList || titleList.length === 0) {
            return [];
        }

        const wordList = await Word.findAll({where: {title: titleList}, include: [StemmedWord]});
        const wordHash = this.createWordTitleHash(wordList);
        for (const title of titleList.filter((t) => !wordHash.has(t))) {
            wordList.push(await this.createWord(title));
        }

        return wordList;
    }

    protected async createStemmedWord(title: string): Promise<StemmedWord> {
        const stemmedWord = new StemmedWord({ title });
        return stemmedWord.save();
    }

    protected async createWord(title: string): Promise<Word> {
        const stemmedWordTitle = stemWord(title);
        let stemmedWord = await StemmedWord.findOne({where: {title: stemmedWordTitle}});
        if (stemmedWord == null) {
            stemmedWord = await this.createStemmedWord(stemmedWordTitle);
        }

        const stemmedWordId = stemmedWord.id;
        const word = new Word({ title, stemmedWordId });
        return word.save();
    }

    protected createWordTitleHash(infoList: Word[]): Map<string, Word> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.title, obj);
        }, new Map<string, Word>());
    }

}
