import { Promise } from "bluebird";
import ViolationService from "../core/service/violationService";
import Statistics from "../models/db/statistics";
import Video from "../models/db/video";
import sequelize from "../sequelize";

const violationService: ViolationService = new ViolationService();

function updateVideoViolation(video: Video): Promise {
    return Statistics.findAll({
        where: {
            videoId: video.videoId,
        },
        order: ["createdAt"],
    })
    .then((statisticsList: Statistics[]) => {
        const arr: Statistics[] = [null, null, null];

        let likeViolationCnt: number = 0;
        let dislikeViolationCnt: number = 0;
        let lastViolationAt: Date = null;
        let lastSt: Statistics;

        for (const statistics of statisticsList) {
            lastSt = statistics;

            arr[0] = arr[1];
            arr[1] = arr[2];
            arr[2] = statistics;

            if (arr[0] != null) {
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

        if (lastSt) {

            return Video.update({
                likeViolationCnt,
                dislikeViolationCnt,
                 lastViolationAt,
                likeCount: lastSt.likeCount,
                dislikeCount: lastSt.dislikeCount,
                viewCount: lastSt.viewCount,
                }, {
                    where: { videoId: video.videoId },
                },
            );
        }

    });
}

sequelize.authenticate()
.then(() => {
    return Video.findAll();
})
.then((videoList) => {
    return Promise.each(videoList, (video) => updateVideoViolation(video));
})
.then(() => {
    sequelize.close();
});
