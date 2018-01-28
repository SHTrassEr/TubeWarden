import { Op } from "sequelize";
import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Summary from "../../models/db/summary";
import Video from "../../models/db/video";
import VideoViolationDislike from "../../models/db/videoViolationDislike";
import VideoViolationLike from "../../models/db/videoViolationLike";

export const SummaryKey = {
    videoCount: "videoCount",
    violationVideoCount: "violationVideoCount",
    likeViolationCount: "likeViolationCount",
    dislikeViolationCount: "dislikeViolationCount",
    likeAndDislikeViolationCount: "likeAndDislikeViolationCount",
    strangeViolationVideoCount: "strangeViolationVideoCount",
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
        await this.updateViolationVideoCount();
        await this.updateLikeViolationVideoCount();
        await this.updateDislikeViolationVideoCount();
        await this.updateLikeAndDislikeViolationVideoCount();
        await this.updateDeletedVideoCount();
        await this.updateDeletedViolationVideoCount();
        await this.updateStrangeViolationVideoCount();
    }

    public async updateViolation(oldLikeViolationIndex, oldDislikeViolationIndex, newLikeViolationIndex, newDislikeViolationIndex) {
        if (oldLikeViolationIndex >= 0 && oldDislikeViolationIndex >= 0 &&
            (newLikeViolationIndex < 0 || newDislikeViolationIndex < 0)) {
            await this.increment(SummaryKey.strangeViolationVideoCount, 1);
        }

        if ((oldLikeViolationIndex < 0 || oldDislikeViolationIndex < 0) &&
            (newLikeViolationIndex >= 0 && newDislikeViolationIndex >= 0)) {
            await this.increment(SummaryKey.strangeViolationVideoCount, -1);
        }

        if ((oldLikeViolationIndex <= 0 || oldDislikeViolationIndex <= 0) &&
            newLikeViolationIndex > 0 && newDislikeViolationIndex > 0) {
            await this.increment(SummaryKey.likeAndDislikeViolationCount, 1);
        }

        if (oldLikeViolationIndex > 0 && oldDislikeViolationIndex > 0 &&
            (newLikeViolationIndex <= 0 || newDislikeViolationIndex <= 0)) {
            await this.increment(SummaryKey.likeAndDislikeViolationCount, -1);
        }

        if (oldLikeViolationIndex <= 0 && newLikeViolationIndex > 0) {
            await this.increment(SummaryKey.likeViolationCount, 1);
        }

        if (oldLikeViolationIndex > 0 && newLikeViolationIndex <= 0) {
            await this.increment(SummaryKey.likeViolationCount, -1);
        }

        if (oldDislikeViolationIndex <= 0 && newDislikeViolationIndex > 0) {
            await this.increment(SummaryKey.dislikeViolationCount, 1);
        }

        if (oldDislikeViolationIndex > 0 && newDislikeViolationIndex <= 0) {
            await this.increment(SummaryKey.dislikeViolationCount, -1);
        }
    }

    public async increment(id: string, value: number) {
        const absValue = Math.abs(value);
        if (!absValue) {
            return;
        }

        const sign = (value > 0) ? " + " : " - ";
        return await Summary.update({ value: Summary.sequelize.literal("value" + sign + absValue ) }, { where: { id } });
    }

    public async getValue(id: string): Promise<number> {
        const summary = await Summary.findById(id);
        return summary ? summary.value : 0;
    }

    public async initTable() {
        await Summary.findOrCreate({where: { id: SummaryKey.videoCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.violationVideoCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.likeViolationCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.dislikeViolationCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.likeAndDislikeViolationCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.deletedVideoCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.deletedViolationVideoCount }});
        await Summary.findOrCreate({where: { id: SummaryKey.strangeViolationVideoCount }});
    }

    protected async updateVideoCount() {
        const videoCount = await Video.count();
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.videoCount}});
    }

    protected async updateLikeViolationVideoCount() {
        const videoCount = await Video.count({
            where: {violationIndexLike:  {[Op.gt]: 0}},
        });
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.likeViolationCount}});
    }

    protected async updateDislikeViolationVideoCount() {
        const videoCount = await Video.count({
            where: {violationIndexDislike:  {[Op.gt]: 0}},
        });
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.dislikeViolationCount}});
    }

    protected async updateLikeAndDislikeViolationVideoCount() {
        const videoCount = await Video.count({
            where: {[Op.and]: [
                {violationIndexLike:  {[Op.gt]: 0}},
                {violationIndexDislike:  {[Op.gt]: 0}},
            ]},
        });
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.likeAndDislikeViolationCount}});
    }
    protected async updateViolationVideoCount() {
        const videoCount = await Video.count({
            where: {[Op.or]: [
                {violationIndexLike:  {[Op.gt]: 0}},
                {violationIndexDislike:  {[Op.gt]: 0}},
            ]},
        });
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.violationVideoCount}});
    }

    protected async updateStrangeViolationVideoCount() {
        const videoCount = await Video.count({
            where: {[Op.or]: [
                {violationIndexLike:  {[Op.lt]: 0}},
                {violationIndexDislike:  {[Op.lt]: 0}},
            ]},
        });
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.strangeViolationVideoCount}});
    }

    protected async updateDeletedVideoCount() {
        const videoCount = await Video.count({where: {deleted: true }});
        await Summary.update({value: videoCount}, {where: {id: SummaryKey.deletedVideoCount}});
    }

    protected async updateDeletedViolationVideoCount() {
        const videoCount = await Video.count({
            where: { deleted: true,
                [Op.or]: [
                {violationIndexLike:  {[Op.gt]: 0}},
                {violationIndexDislike:  {[Op.gt]: 0}},
            ]},
        });

        await Summary.update({value: videoCount}, {where: {id: SummaryKey.deletedViolationVideoCount}});
    }

    protected createSummaryHash(infoList: Summary[]): Map<string, Summary> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.id, obj);
        }, new Map<string, Summary>());
    }
}
