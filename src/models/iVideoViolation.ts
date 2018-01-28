export default interface IVideoViolation {

    videoId: string;

    maxAnglePositive: number;

    sumAnglePositive: number;

    maxAngleNegative: number;

    sumAngleNegative: number;

    violationIndex: number;

    firstViolationAt: Date;

    lastViolationAt: Date;
}
