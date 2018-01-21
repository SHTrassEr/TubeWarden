import { Op } from "sequelize";
import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Summary from "../../models/db/summary";
import Video from "../../models/db/video";

const key = {
    videoCount: "videoCount",
    violationVideoCount: "violationVideoCount",
    likeViolationCount: "likeViolationCount",
    dislikeViolationCount: "dislikeViolationCount",
    likeAndDislikeViolationCount: "likeAndDislikeViolationCount",
    deletedVideoCount: "deletedVideoCount",
    deletedViolationVideoCount: "deletedViolationVideoCount",
};

const videoCountKey = "videoCount";

export default class SummaryService {

    public async getAll(): Promise<Summary[]> {
        return await Summary.findAll();
    }

    public async updateAll() {
        await this.updateVideoCount();
        await this.updateViolationCount();
        await this.updateLikeViolationCount();
        await this.updateDislikeViolationCount();
        await this.updateLikeAndDislikeViolationCount();
        await this.updateDeletedCount();
        await this.updateDeletedViolationVideoCount();
    }

    public async increaseVideoCount() {
        return await this.increaseValue(key.videoCount);
    }

    public async increaseViolationCount() {
        return await this.increaseValue(key.violationVideoCount);
    }

    public async getVideoCount(): Promise<number> {
        return await this.getValue(key.videoCount);
    }

    public async getViolationCount(): Promise<number> {
        return await this.getValue(key.violationVideoCount);
    }

    public async updateVideoCount() {
        const videoCount = await Video.count();
        await Summary.update({value: videoCount}, {where: {id: key.videoCount}});
    }

    public async updateLikeViolationCount() {
        const videoCount = await Video.count({where : {  likeViolationCnt: {[Op.gt]: 0}, dislikeViolationCnt: 0 }});
        await Summary.update({value: videoCount}, {where: {id: key.likeViolationCount}});
    }

    public async updateLikeAndDislikeViolationCount() {
        const videoCount = await Video.count({where : {  likeViolationCnt: {[Op.gt]: 0}, dislikeViolationCnt: {[Op.gt]: 0}}});
        await Summary.update({value: videoCount}, {where: {id: key.likeAndDislikeViolationCount}});
    }

    public async updateDislikeViolationCount() {
        const videoCount = await Video.count({where : {  dislikeViolationCnt: {[Op.gt]: 0}, likeViolationCnt: 0 }});
        await Summary.update({value: videoCount}, {where: {id: key.dislikeViolationCount}});
    }

    public async updateViolationCount() {
        const videoCount = await Video.count({where: {lastViolationAt: {[Op.ne]: null}}});
        await Summary.update({value: videoCount}, {where: {id: key.violationVideoCount}});
    }

    public async updateDeletedCount() {
        const videoCount = await Video.count({where: {deleted: true }});
        await Summary.update({value: videoCount}, {where: {id: key.deletedVideoCount}});
    }

    public async updateDeletedViolationVideoCount() {
        const videoCount = await Video.count({where: {deleted: true, lastViolationAt: {[Op.ne]: null} }});
        await Summary.update({value: videoCount}, {where: {id: key.deletedViolationVideoCount}});
    }

    public async initTable() {
        await Summary.findOrCreate({where: { id: key.videoCount }});
        await Summary.findOrCreate({where: { id: key.violationVideoCount }});
        await Summary.findOrCreate({where: { id: key.likeViolationCount }});
        await Summary.findOrCreate({where: { id: key.dislikeViolationCount }});
        await Summary.findOrCreate({where: { id: key.likeAndDislikeViolationCount }});
        await Summary.findOrCreate({where: { id: key.deletedVideoCount }});
        await Summary.findOrCreate({where: { id: key.deletedViolationVideoCount }});
    }

    protected async getValue(id: string): Promise<number> {
        const summary = await Summary.findById(id);
        return summary ? summary.value : 0;
    }

    protected async increaseValue(id: string) {
        return Summary.update({ value: Summary.sequelize.literal("value + 1") }, { where: { id } });
    }

    protected createSummaryHash(infoList: Summary[]): Map<string, Summary> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj);
        }, new Map<string, Summary>());
    }
}
