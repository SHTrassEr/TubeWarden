import { Request, Response } from "express";
import Channel from "../../models/db/channel";
import Video from "../../models/db/video";

export async function getSummary(req: Request, res: Response) {
    res.render("summary", {  });
}
