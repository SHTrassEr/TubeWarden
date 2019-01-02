
import ViolationService from "../core/service/violationService";
import Statistics from "../models/db/statistics";
import Video from "../models/db/video";
import VideoViolationDislike from "../models/db/videoViolationDislike";
import VideoViolationLike from "../models/db/videoViolationLike";
import IVideoViolation from "../models/iVideoViolation";
import sequelize from "../sequelize";

const violationService: ViolationService = new ViolationService();

function clearVideoViolation(videoViolation: IVideoViolation) {
    videoViolation.maxAnglePositive = 0;
    videoViolation.maxAngleNegative = 0;
    videoViolation.sumAnglePositive = 0;
    videoViolation.sumAngleNegative = 0;
    videoViolation.firstViolationAt = null;
    videoViolation.lastViolationAt = null;
    videoViolation.violationIndex = 0;
}

async function updateVideoViolation(video: Video) {

    const statisticsList = await Statistics.findAll({
        where: {
            videoId: video.videoId,
        },
        order: ["createdAt"],
    });

    let videoViolationLike = video.violationLike;
    if (videoViolationLike == null) {
        videoViolationLike = await VideoViolationLike.create({ videoId: video.videoId });
    }

    let videoViolationDislike = video.violationDislike;
    if (videoViolationDislike == null) {
        videoViolationDislike = await VideoViolationDislike.create({ videoId: video.videoId });
    }

    const arr: Statistics[] = [null, null, null];

    clearVideoViolation(videoViolationLike);
    clearVideoViolation(videoViolationDislike);

    let lastSt: Statistics;

    for (const statistics of statisticsList) {
        lastSt = statistics;

        arr[0] = arr[1];
        arr[1] = arr[2];
        arr[2] = statistics;

        if (arr[0] != null) {
            violationService.updateViolation(arr, "likeCount", videoViolationLike);
            violationService.updateViolation(arr, "dislikeCount", videoViolationDislike);
        }
    }

    await videoViolationLike.save();
    await videoViolationDislike.save();

    if (lastSt) {
        video.violationIndexLike = videoViolationLike.violationIndex;
        video.violationIndexDislike = videoViolationDislike.violationIndex;
        video.likeCount = lastSt.likeCount;
        video.dislikeCount = lastSt.dislikeCount;
        video.viewCount = lastSt.viewCount;
        await video.save();

    }

}

sequelize.authenticate()
.then(async () => {

/*
    const videoList = await Video.findAll({
        where: {videoId: "CfI4a0lJ7rA"},
        include: [{
            model: VideoViolationLike,
        },
        {
            model: VideoViolationDislike,
        }],
    });
*/
    const videoList = await Video.findAll({
        include: [{
            model: VideoViolationLike,
        },
        {
            model: VideoViolationDislike,
        }],
    });
    for (const video of videoList) {
        await updateVideoViolation(video);
    }

    sequelize.close();
});
