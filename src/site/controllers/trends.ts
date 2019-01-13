import { Request, Response } from "express";
import * as moment from "moment";

function getSearchString(req: Request): string {
    return req.param("s", "");
}

export async function getTrends(req: Request, res: Response) {
    const startDate = null;
    const endDate = null;
    const searchString = "";
    res.render("trends", {searchString, dateRange: {startDate, endDate}});
}
