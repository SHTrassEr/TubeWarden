import { GoogleChannelInfo } from "../../models/google/itemInfo";

import Tag from "../../models/db/tag";

export default class TagService {

    public async getOrCreateTagList(tagTitleList: string[]): Promise<Tag[]> {
        if (!tagTitleList || tagTitleList.length === 0) {
            return [];
        }

        tagTitleList = tagTitleList.map((t) => t.toLowerCase());
        const tagList = await Tag.findAll({where: {title: tagTitleList}});
        const tagHash = this.createTagTitleHash(tagList);
        for (const title of tagTitleList.filter((t) => !tagHash.has(t))) {
            tagList.push(await this.createTag(title));
        }

        return tagList;
    }

    public async createTag(title: string): Promise<Tag> {
        const tag = new Tag({ title });
        return tag.save();
    }

    protected createTagTitleHash(infoList: Tag[]): Map<string, Tag> {
        return infoList.reduce((map, obj) => {
            return map.set(obj.title, obj);
        }, new Map<string, Tag>());
    }

}
