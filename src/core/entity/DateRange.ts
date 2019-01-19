import * as moment from "moment";

export default class DateRange implements IDateRange {
    public startDate: Date;
    public endDate: Date;

    constructor(startDate?: Date|string, endDate?: Date|string) {
        this.startDate = this.getDate(startDate);
        this.endDate = this.getDate(endDate);
    }

    protected getDate(date?: Date|string): Date {
        if (date instanceof Date) {
            return date;
        } else if (date) {
            const d = moment(date);
            if (d.isValid()) {
                return d.toDate();
            }
        }

        return null;
    }
}

export interface IDateRange {
    startDate: Date;
    endDate: Date;
}
