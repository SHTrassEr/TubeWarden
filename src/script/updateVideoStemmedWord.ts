import sequelize from "../sequelize";

import { Op } from "sequelize";

import StemmedWordService from "../core/service/stemmedWordService";

import StemmedWord from "../models/db/stemmedWord";
import Video from "../models/db/video";
import Word from "../models/db/word";

import createPager from "../utils/pager";

const stemmedWordService = new StemmedWordService();

async function process(): Promise<any> {

    const videoCnt = await Video.count();
    const pageSize = 50;
    let currentPage = 1;

    await StemmedWord.destroy({ where: { id : { [Op.gt]: 0 } }});
    await Word.destroy({ where: { id : { [Op.gt]: 0 } }});

    do {
        const pager = createPager(videoCnt, currentPage, pageSize);
        const videoList = await Video.findAll({
            offset: pager.offset,
            limit: pageSize,
            order: [
                ["createdAt", "DESC"],
            ],
        });

        for (const video of videoList) {
            await stemmedWordService.updateVideo(video.videoId);
        }
        currentPage = pager.previousPage;
    } while (currentPage);
}

sequelize.authenticate()
.then(() => {
    return process();
})
.then(() => {
    sequelize.close();
});
