import { Request, Response } from "express";

import DateRange from "../../core/entity/DateRange";

function getSearchString(req: Request): string {
    return req.param("s", "");
}

function getDateRange(req: Request): DateRange {
    return new DateRange(req.param("start", ""), req.param("end", ""));
}

export async function getTrends(req: Request, res: Response) {
    const dateRange = getDateRange(req);
    const searchString = getSearchString(req);
    res.render("trends", {searchString, dateRange });
}
