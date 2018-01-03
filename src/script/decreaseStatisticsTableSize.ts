import { Promise } from "bluebird";
import ViolationService from "../grabber/service/violationService";


import sequelize from "../sequelize";
import Statistics  from "../models/Statistics";
import Video   from "../models/Video";


var violationService: ViolationService = new ViolationService();

var totalD: number = 0;

function isStatisticsAtLine(stl: Statistics, stm: Statistics, str: Statistics): boolean {
    var arr: Statistics[] = [stl, stm, str];

    return violationService.isStatisticsAtLine(arr, "likeCount")
        && violationService.isStatisticsAtLine(arr, "dislikeCount")
        && violationService.isStatisticsAtLine(arr, "viewCount");
}

function process(video: Video): Promise {
    return Statistics.findAll({
        where: {
            videoId: video.videoId
        },
        order: ["id"]
    })
    .then((statisticsList: Statistics[]) => {

        var s1: Statistics = null;
        var s2: Statistics = null;
        for(var st of statisticsList) {

            if(s1 != null && s2 != null) {
                if(isStatisticsAtLine(s1, s2, st)) {
                    totalD++;

                    // s2.destroy();

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
    return Promise.each(videoList, video => process(video));
})
.then(() => {
    console.log(totalD);
    sequelize.close();
});
