import Statistics from "../../models/db/Statistics";

const violationFactor = 0.015;
const minViolationValue = 200;

const itemCnt = 3;

const atLineEp = 0.000075;
const maxLineMin = 45;

export default class ViolationService {

    public getRequredItemCnt(): number {
        return itemCnt;
    }

    public check(arr: Statistics[], yf: string): boolean {
        if (arr.length === itemCnt && this.getX(arr[2]) !== this.getX(arr[1]) && this.getX(arr[1]) !== this.getX(arr[0])) {

            const stl: Statistics = arr[0];
            const stm: Statistics = arr[1];
            const str: Statistics = arr[2];

            if (stl[yf] === stm[yf] && stm[yf] === str[yf]) {
                return false;
            }

            if (!stl[yf] || !stm[yf] || !str[yf]) {
                return false;
            }

            const dx: number = (this.getX(arr[2]) - this.getX(arr[1])) / 1000 / 60;
            const y: number = (this.getX(arr[2]) - this.getX(arr[0])) *
                (arr[1][yf] - arr[0][yf]) / (this.getX(arr[1]) - this.getX(arr[0])) + arr[0][yf];

            let e: number = arr[1][yf] * violationFactor;
            if (e < minViolationValue) {
                e = minViolationValue;
            }

            if (Math.abs(arr[2][yf] - y) > e * dx) {
                return true;
            }
        }

        return false;
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

        const dx: number = (this.getX(stm) - this.getX(stl)) / 1000 / 60;
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
        return st.updatedAt.getTime();
    }

}
