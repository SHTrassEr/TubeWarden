import { expect } from "chai";
import ViolationService from "../../../core/service/violationService";
import { IStatistics } from "../../../models/db/statistics";

const violationService = new ViolationService();

describe("violationServiceTest.isStatisticsAtLine", () => {
    it("should allow zero point on zero line", () => {
        const zeroPoint: any =  {likeCount: 0, dislikeCount: 0, viewCount: 0, createdAt : new Date(0), updatedAt: new Date(0)};
        const line = [zeroPoint, zeroPoint, zeroPoint];
        const result = violationService.isStatisticsAtLine(zeroPoint, line);
        expect(result).to.equal(true);
    });

    it("should allow point on line y = x", () => {
        const line: any = [
            {likeCount: 0, dislikeCount: 0, viewCount: 0, createdAt : new Date(0), updatedAt: new Date(0)},
            {likeCount: 200, dislikeCount: 200, viewCount: 200, createdAt : new Date(200), updatedAt: new Date(200)},
            {likeCount: 300, dislikeCount: 300, viewCount: 300, createdAt : new Date(300), updatedAt: new Date(300)}];
        const point: any =  {likeCount: 4000, dislikeCount: 4000, viewCount: 4000, createdAt : new Date(4000), updatedAt: new Date(4000)};
        const result = violationService.isStatisticsAtLine(point, line);
        expect(result).to.equal(true);
      });

    it("should allow point on line y = 2 * x", () => {
        const line: any = [
            {likeCount: 1000, dislikeCount: 100, viewCount: 10, createdAt : new Date(10000), updatedAt: new Date(10000)},
            {likeCount: 4000, dislikeCount: 400, viewCount: 40, createdAt : new Date(20000), updatedAt: new Date(20000)},
            {likeCount: 6000, dislikeCount: 600, viewCount: 60, createdAt : new Date(30000), updatedAt: new Date(30000)}];
        const point: any =  {likeCount: 8001, dislikeCount: 799, viewCount: 81, createdAt : new Date(40000), updatedAt: new Date(40000)};
        const result = violationService.isStatisticsAtLine(point, line);
        expect(result).to.equal(true);
      });

    it("should reject point not on line y = 2 * x", () => {
        const line: any = [
            {likeCount: 1000, dislikeCount: 100, viewCount: 10, createdAt : new Date(10000), updatedAt: new Date(10000)},
            {likeCount: 4000, dislikeCount: 400, viewCount: 40, createdAt : new Date(20000), updatedAt: new Date(20000)},
            {likeCount: 6000, dislikeCount: 600, viewCount: 60, createdAt : new Date(30000), updatedAt: new Date(30000)}];
        const point: any =  {likeCount: 80000, dislikeCount: 8000, viewCount: 800, createdAt : new Date(40000), updatedAt: new Date(40000)};
        const result = violationService.isStatisticsAtLine(point, line);
        expect(result).to.equal(false);
      });
  });

describe("violationServiceTest.getAngle", () => {
    it("should return zero angle for zero line", () => {
        const zeroPoint: any =  {likeCount: 0, dislikeCount: 0, viewCount: 0, createdAt : new Date(0), updatedAt: new Date(0)};
        const result = violationService.getAngle(zeroPoint, zeroPoint, zeroPoint, "likeCount");
        expect(result).to.deep.equal([0, 0]);
    });

    it("should return zero angle for y = 2 * x", () => {
        const line: any = [
            {likeCount: 1000, dislikeCount: 100, viewCount: 10, createdAt : new Date(10000), updatedAt: new Date(10000)},
            {likeCount: 4000, dislikeCount: 400, viewCount: 40, createdAt : new Date(20000), updatedAt: new Date(20000)},
            {likeCount: 6000, dislikeCount: 600, viewCount: 60, createdAt : new Date(30000), updatedAt: new Date(30000)}];

        const result = violationService.getAngle(line[0], line[1], line[2], "likeCount");
        expect(result[0]).to.be.closeTo(0, 0.01);
        expect(result[1]).to.be.closeTo(0, 0.01);
    });

    it("should return 45 degrees angle", () => {
        const line: any = [
            {likeCount: 1000, dislikeCount: 100, viewCount: 10, createdAt : new Date(10000), updatedAt: new Date(10000)},
            {likeCount: 1000, dislikeCount: 100, viewCount: 10, createdAt : new Date(20000), updatedAt: new Date(20000)},
            {likeCount: 1060, dislikeCount: 100, viewCount: 10, createdAt : new Date(80000), updatedAt: new Date(80000)}];

        const result = violationService.getAngle(line[0], line[1], line[2], "likeCount");
        expect(result[0]).to.be.closeTo(Math.PI / 4, 0.01);
        expect(result[1]).to.be.closeTo(0, 0.01);
    });
});
