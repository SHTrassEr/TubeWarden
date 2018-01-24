import Statistics from "../../models/db/statistics";
import Video from "../../models/db/video";
import VideoViolation from "../../models/db/videoViolation";

const violationFactor = 0.015;
const minViolationValue = 200;

const itemCnt = 3;

const atLineEp = 0.000075;
const maxLineMin = 45;

const maxLineCheckMin = 60;

export default class ViolationService {

    public getRequredItemCnt(): number {
        return itemCnt;
    }

    public updateViolation(arr: Statistics[], videoViolation: VideoViolation): boolean {
        const bLike = this.updateViolationLike(arr, videoViolation);
        const bDislike = this.updateViolationDislike(arr, videoViolation);
        return bLike || bDislike;
    }

    public updateVideo(video: Video, videoViolation: VideoViolation) {
        video.likeViolationCnt  = 0;
        if (videoViolation.maxAnglePositiveLike > 1.2) {
            video.likeViolationCnt += 1;
        }
        if (videoViolation.sumAnglePositiveLike > 4) {
            video.likeViolationCnt += 1;
        }
        if (videoViolation.sumAnglePositiveLike > 10) {
            video.likeViolationCnt += 1;
        }

        video.dislikeViolationCnt = 0;
        if (videoViolation.maxAnglePositiveDislike > 1.2) {
            video.dislikeViolationCnt += 1;
        }
        if (videoViolation.sumAnglePositiveDislike > 4) {
            video.dislikeViolationCnt += 1;
        }
        if (videoViolation.sumAnglePositiveDislike > 10) {
            video.dislikeViolationCnt += 1;
        }

        if (videoViolation.sumAngleNegativeLike > 3 || videoViolation.maxAngleNegativeLike > 1.6) {
            video.likeStrangeCnt = 1;
            video.likeViolationCnt = 0;
        }

        if (videoViolation.sumAngleNegativeDislike > 3 || videoViolation.maxAngleNegativeDislike > 1.6) {
            video.dislikeStrangeCnt = 1;
            video.dislikeViolationCnt = 0;
        }
    }

    public updateViolationLike(arr: Statistics[], videoViolation: VideoViolation): boolean {
        const [positiveAngle, negativeAngle] = this.getAngle(arr, "likeCount");
        if (positiveAngle) {
            videoViolation.maxAnglePositiveLike = Math.max(videoViolation.maxAnglePositiveLike, positiveAngle);
            videoViolation.sumAnglePositiveLike += positiveAngle;
        }

        if (negativeAngle) {
            videoViolation.maxAngleNegativeLike = Math.max(videoViolation.maxAnglePositiveLike, negativeAngle);
            videoViolation.sumAngleNegativeLike += negativeAngle;
        }

        return (positiveAngle > 0) || (negativeAngle > 0);
    }

    public updateViolationDislike(arr: Statistics[], videoViolation: VideoViolation): boolean {
        const [positiveAngle, negativeAngle] = this.getAngle(arr, "dislikeCount");
        if (positiveAngle) {
            videoViolation.maxAnglePositiveDislike = Math.max(videoViolation.maxAnglePositiveLike, positiveAngle);
            videoViolation.sumAnglePositiveDislike += positiveAngle;
        }

        if (negativeAngle) {
            videoViolation.maxAngleNegativeDislike = Math.max(videoViolation.maxAnglePositiveLike, negativeAngle);
            videoViolation.sumAngleNegativeDislike += negativeAngle;
        }

        return (positiveAngle > 0) || (negativeAngle > 0);
    }

    public getAngle(arr: Statistics[], yf: string): [number, number] {

        if (arr.length < itemCnt) {
            return [0, 0];
        }

        let [positiveAngle, negativeAngle] = this.getAngle2(arr[arr.length - 3], arr[arr.length - 2], arr[arr.length - 1], yf);

        if (Math.abs(positiveAngle) < 0.6) {
            positiveAngle = 0;
        }

        if (Math.abs(negativeAngle) < 0.6) {
            negativeAngle = 0;
        }

        return [positiveAngle, negativeAngle];
    }

    public isPointAtLine(point: Statistics, line: Statistics[], yf: string, ep?: number): boolean {
        if (line.length < 2) {
            return false;
        }

        if (!ep) {
            ep = atLineEp;
        }

        const stl: Statistics = line[line.length - 2];
        const stm: Statistics = line[line.length - 1];
        const str: Statistics = point;

        if (stl[yf] === stm[yf] && stm[yf] === str[yf]) {
            return true;
        }

        if (!stl[yf] || !stm[yf] || !str[yf]) {
            return false;
        }

        const dx: number = (this.getX(stm) - this.getX(stl)) / 60;
        if (dx > maxLineMin) {
            return false;
        }

        const y: number = ((this.getX(stm) - this.getX(stl)) * (str[yf] - stl[yf])) / (this.getX(str) - this.getX(stl)) + stl[yf];
        let ey: number =  ep * y * dx;
        if (ey < 1) {
            ey = 1;
        }
        return Math.abs(stm[yf] - y) <=  ey;
    }

    public isStatisticsAtLine(point: Statistics, line: Statistics[]): boolean {
        return this.isPointAtLine(point, line, "likeCount")
            && this.isPointAtLine(point, line, "dislikeCount")
            && this.isPointAtLine(point, line, "viewCount", 0.01);
    }

    protected getAngle2(stl: Statistics, stm: Statistics, str: Statistics, yf: string): [number, number] {
        if (this.getX(str) !== this.getX(stm) && this.getX(stm) !== this.getX(stl)) {

            if (stl[yf] === stm[yf] && stm[yf] === str[yf]) {
                return [0, 0];
            }

            if (!stl[yf] || !stm[yf] || !str[yf]) {
                return [0, 0];
            }

            if (str[yf] < 350) {
                return [0, 0];
            }

            const p1 =  {
                x: 0,
                y: 0,
            };

            const p2 =  {
                x: 0,
                y: 0,
            };

            p1.x = (this.getX(stl) - this.getX(stm)) * -1;
            p1.y = (stl[yf] - stm[yf]) * -1;

            p2.x = this.getX(str) - this.getX(stm);
            p2.y = str[yf] - stm[yf];

            const positiveAngle = this.getVectorAngle(p1, p2);
            let negativeAngle = 0;

            if (p2.y < 0) {
                p1.y = 0;
                negativeAngle = this.getVectorAngle(p1, p2);
            }

            return [positiveAngle, negativeAngle];
        }

        return [0, 0];
    }

    protected getVectorAngle(p1, p2) {

        if ((p1.x > maxLineCheckMin * 60  || (p2.x > maxLineCheckMin * 60 ))) {
            return 0;
        }

        const cos = ((p1.x * p2.x + p1.y * p2.y) / Math.pow(p1.x * p1.x + p1.y * p1.y, 0.5)) / Math.pow(p2.x * p2.x + p2.y * p2.y, 0.5);
        if (cos >= 1) {
            return 0;
        }

        const angle = Math.acos(cos);
        return angle;
    }

    protected getX(st: Statistics): number {
        return ((st.updatedAt.getTime() / 1000) );
    }

}
