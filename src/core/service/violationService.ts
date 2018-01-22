import Statistics from "../../models/db/statistics";

const violationFactor = 0.015;
const minViolationValue = 200;

const itemCnt = 3;

const atLineEp = 0.000075;
const maxLineMin = 45;

const maxLineCheckMin = 60;

const p1 =  {
    x: 0,
    y: 0,
};

const p2 =  {
    x: 0,
    y: 0,
};

export default class ViolationService {

    public getRequredItemCnt(): number {
        return itemCnt;
    }

    public getAngle(arr: Statistics[], yf: string): number {

        if (arr.length < itemCnt) {
            return 0;
        }

        const stl: Statistics = arr[arr.length - 3];
        const stm: Statistics = arr[arr.length - 2];
        const str: Statistics = arr[arr.length - 1];

        if (this.getX(str) !== this.getX(stm) && this.getX(stm) !== this.getX(stl)) {

            if (stl[yf] === stm[yf] && stm[yf] === str[yf]) {
                return 0;
            }

            if (!stl[yf] || !stm[yf] || !str[yf]) {
                return 0;
            }

            if ((stl[yf] > stm[yf]) || (stm[yf] > str[yf]) ) {
                return 0;
            }

            p1.x = (this.getX(stl) - this.getX(stm)) * -1;
            p1.y = (stl[yf] - stm[yf]) * -1;

            p2.x = this.getX(str) - this.getX(stm);
            p2.y = str[yf] - stm[yf];

            if ((p1.x > maxLineCheckMin * 60  || (p2.x > maxLineCheckMin * 60 ))) {
                return 0;
            }

            const cos = ((p1.x * p2.x + p1.y * p2.y) / Math.pow(p1.x * p1.x + p1.y * p1.y, 0.5)) / Math.pow(p2.x * p2.x + p2.y * p2.y, 0.5);
            const angle = Math.acos(cos);
            return angle;
        }

        return 0;

    }

    public check(arr: Statistics[], yf: string): boolean {
        const angle = this.getAngle(arr, yf);
        const stm: Statistics = arr[arr.length - 2];
        const str: Statistics = arr[arr.length - 1];
        const m = stm[yf];
        const r = str[yf];

        if (m < 400 && r > 800) {
            return (angle > 1.7);
        }

        if (angle > 1) {
            return true;
        }

        return false;

        // return (angle > 0.7);
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

    protected getX(st: Statistics): number {
        return ((st.updatedAt.getTime() / 1000) );
    }

}
