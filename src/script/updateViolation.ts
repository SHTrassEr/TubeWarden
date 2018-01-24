
import ViolationService from "../core/service/violationService";
import Statistics from "../models/db/statistics";
import Video from "../models/db/video";
import VideoViolation from "../models/db/videoViolation";
import sequelize from "../sequelize";

const violationService: ViolationService = new ViolationService();

async function updateVideoViolation(video: Video) {

    const statisticsList = await Statistics.findAll({
        where: {
            videoId: video.videoId,
        },
        order: ["createdAt"],
    });

    const [videoViolation] = await VideoViolation.findOrCreate({ where: { videoId: video.videoId }});
    const arr: Statistics[] = [null, null, null];

    videoViolation.maxAnglePositiveLike = 0;
    videoViolation.maxAngleNegativeLike = 0;
    videoViolation.sumAnglePositiveLike = 0;
    videoViolation.sumAngleNegativeLike = 0;
    videoViolation.maxAnglePositiveDislike = 0;
    videoViolation.maxAngleNegativeDislike = 0;
    videoViolation.sumAnglePositiveDislike = 0;
    videoViolation.sumAngleNegativeDislike = 0;

    let lastViolationAt: Date = null;
    let lastSt: Statistics;

    for (const statistics of statisticsList) {
        lastSt = statistics;

        arr[0] = arr[1];
        arr[1] = arr[2];
        arr[2] = statistics;

        if (arr[0] != null) {
            if (violationService.updateViolation(arr, videoViolation)) {
                lastViolationAt = statistics.updatedAt;
            }
        }
    }

    await videoViolation.save();

    if (lastSt) {

        violationService.updateVideo(video, videoViolation);
        video.likeCount = lastSt.likeCount;
        video.dislikeCount = lastSt.dislikeCount;
        video.viewCount = lastSt.viewCount;
        video.lastViolationAt = lastViolationAt;
        await video.save();

    }

}

sequelize.authenticate()
.then(async () => {
    // const videoList = await Video.findAll({where: {videoId: "eSN6nkEbwCE"}});
    const videoList = await Video.findAll();
    for (const video of videoList) {
        await updateVideoViolation(video);
    }

    sequelize.close();
});
