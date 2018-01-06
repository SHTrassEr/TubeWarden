import { Promise } from "bluebird";
import ViolationService from "../grabber/service/violationService";

import sequelize from "../sequelize";
import Statistics  from "../models/db/Statistics";
import Video   from "../models/db/Video";


var violationService: ViolationService = new ViolationService();

function updateVideoViolation(video: Video): Promise {
    return Statistics.findAll({
        where: {
            videoId: video.videoId
        },
        order: ["createdAt"]
    })
    .then((statisticsList: Statistics[]) => {
        var arr: Statistics[] = [null, null, null];

        var likeViolationCnt: number = 0;
        var dislikeViolationCnt: number = 0;

        var lastViolationAt: Date = null;

        var lastSt: Statistics;


        for(var statistics of statisticsList) {
            lastSt = statistics;

            arr[0] = arr[1];
            arr[1] = arr[2];
            arr[2] = statistics;

            if(arr[0] != null) {
                if (violationService.check(arr, "likeCount")) {
                    likeViolationCnt ++;
                    lastViolationAt = arr[2].createdAt;
                }

                if (violationService.check(arr, "dislikeCount")) {
                    dislikeViolationCnt ++;
                    lastViolationAt = arr[2].createdAt;
                }
            }
        }

        if(statistics) {

            return Video.update({
                likeViolationCnt: likeViolationCnt,
                dislikeViolationCnt:dislikeViolationCnt,
                lastViolationAt: lastViolationAt,
                likeCount: lastSt.likeCount,
                dislikeCount: lastSt.dislikeCount,
                viewCount: lastSt.viewCount
                }, {
                    where: {videoId: video.videoId}
                }
            );
        }

    });
}


sequelize.authenticate()
.then(() => {
    return Video.findAll();
})
.then((videoList) => {
    return Promise.each(videoList, video => updateVideoViolation(video));
})
.then(() => {
    sequelize.close();
});
