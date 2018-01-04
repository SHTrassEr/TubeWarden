import Statistics  from "../../models/Statistics";

var violationFactor: number = 0.04;
var minViolationValue: number = 200;

var itemCnt: number = 3;

var atLineEp: number = 0.00025;

export default class ViolationService {

    getX(st: Statistics): number {
        return st.updatedAt.getTime();
    }

    getRequredItemCnt(): number {
        return itemCnt;
    }

    check(arr: Statistics[], yf: string): boolean {
        if(arr.length === itemCnt && this.getX(arr[2]) !== this.getX(arr[1]) && this.getX(arr[1]) !== this.getX(arr[0])) {
            var dx: number = (this.getX(arr[2]) - this.getX(arr[1])) / 1000 / 60;
            var y: number = (this.getX(arr[2]) - this.getX(arr[0])) *
                (arr[1][yf] - arr[0][yf]) / (this.getX(arr[1]) - this.getX(arr[0])) + arr[0][yf];

            var e: number = arr[0][yf] * violationFactor;
            if(e < minViolationValue) {
                e = minViolationValue;
            }

            if (Math.abs(arr[2][yf] - y) > e * dx) {
                return true;
            }
        }

        return false;
    }

    isStatisticsAtLine(arr: Statistics[], yf: string, ep?: number): boolean {
        if(!ep) {
            ep = atLineEp;
        }

        var stl: Statistics = arr[0];
        var stm: Statistics = arr[1];
        var str: Statistics = arr[2];
        var y: number = ((this.getX(stm) - this.getX(stl))*(str[yf] - stl[yf])) / (this.getX(str) - this.getX(stl)) + stl[yf];
        var ey: number =  ep * y;
        if(ey < 1) {
            ey = 1;
        }
        return Math.abs(stm[yf] - y) <=  ey;
    }
}
