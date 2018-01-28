import Statistics from "../../models/db/statistics";
import Video from "../../models/db/video";
import IVideoViolation from "../../models/iVideoViolation";

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

    public updateViolation(arr: Statistics[], fieldName: string, videoViolation: IVideoViolation): boolean {
        const [positiveAngle, negativeAngle] = this.getAngle(arr, fieldName);

        if (positiveAngle) {
            videoViolation.maxAnglePositive = Math.max(videoViolation.maxAnglePositive, positiveAngle);
            videoViolation.sumAnglePositive += positiveAngle;
        }

        if (negativeAngle) {
            videoViolation.maxAngleNegative = Math.max(videoViolation.maxAngleNegative, negativeAngle);
            videoViolation.sumAngleNegative += negativeAngle;
        }

        if (videoViolation.sumAngleNegative > 3 || videoViolation.maxAngleNegative > 1.6) {
            videoViolation.violationIndex = -1;
        } else {
            videoViolation.violationIndex = 0;
            if (videoViolation.maxAnglePositive > 1.2) {
                videoViolation.violationIndex += 1;
            }
            if (videoViolation.sumAnglePositive > 4) {
                videoViolation.violationIndex += 1;
            }
            if (videoViolation.sumAnglePositive > 10) {
                videoViolation.violationIndex += 1;
            }
        }

        if (positiveAngle > 0 || negativeAngle > 0) {
            if (!videoViolation.firstViolationAt) {
                videoViolation.firstViolationAt = new Date();
            }

            videoViolation.lastViolationAt = new Date();
            return true;
        }

        return false;
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
