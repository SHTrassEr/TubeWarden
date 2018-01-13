import { Op } from "sequelize";
import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Summary from "../../models/db/summary";
import Video from "../../models/db/video";

const key = {
    videoCount: "videoCount",
    violationCount: "violationCount",
    violationCount_ge_2: "violationCount_ge_2",
    violationCount_ge_3: "violationCount_ge_3",

};

const videoCountKey = "videoCount";

export default class SummaryService {

    public async getAll(): Promise<Summary[]> {
        return await Summary.findAll();
    }

    public async updateAll() {
        await this.updateVideoCount();
        await this.updateViolationCount();
    }

    public async increaseVideoCount() {
        return await this.increaseValue(key.videoCount);
    }

    public async increaseViolationCount() {
        return await this.increaseValue(key.violationCount);
    }

    public async getVideoCount(): Promise<number> {
        return await this.getValue(key.videoCount);
    }

    public async getViolationCount(): Promise<number> {
        return await this.getValue(key.violationCount);
    }

    public async updateVideoCount() {
        const videoCount = await Video.count();
        await Summary.update({value: videoCount}, {where: {id: key.videoCount}});
    }

    public async updateViolationCount() {
        const videoCount = await Video.count({where: {lastViolationAt: {[Op.ne]: null}}});
        await Summary.update({value: videoCount}, {where: {id: key.violationCount}});
    }

    public async initTable() {
        await Summary.findOrCreate({where: { id: key.videoCount }});
        await Summary.findOrCreate({where: { id: key.violationCount }});
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
