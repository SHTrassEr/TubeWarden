import { Promise } from "bluebird";
import ViolationService from "../core/service/violationService";

import Statistics from "../models/db/statistics";
import Video from "../models/db/video";
import sequelize from "../sequelize";

const violationService: ViolationService = new ViolationService();

let totalD: number = 0;

function process(video: Video): Promise {
    return Statistics.findAll({
        where: {
            videoId: video.videoId,
        },
        order: ["createdAt"],
    })
    .then((statisticsList: Statistics[]) => {

        let s1: Statistics = null;
        let s2: Statistics = null;
        for (const st of statisticsList) {

            if (s1 != null && s2 != null) {
                if (violationService.isStatisticsAtLine(st, [s1, s2])) {
                    totalD++;
                    s2.destroy();
                    s2 = st;
                    continue;
                }
            }

            s1 = s2;
            s2 = st;
        }
    });
}

sequelize.authenticate()
.then(() => {
    return Video.findAll();
})
.then((videoList) => {
    return Promise.each(videoList, (video) => process(video));
})
.then(() => {
    sequelize.close();
});
