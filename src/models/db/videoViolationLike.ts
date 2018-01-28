import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";

import IVideoViolation from "../iVideoViolation";

import Video from "./video";

@Table( {
    tableName: "video_violation_like",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
    indexes: [
    ],
})
export default class VideoViolationLike extends Model<VideoViolationLike> implements IVideoViolation {

    @ForeignKey(() => Video)
    @Column({ primaryKey: true, allowNull: false })
    public videoId: string;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public maxAnglePositive: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public sumAnglePositive: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public maxAngleNegative: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public sumAngleNegative: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public violationIndex: number;

    @Column(DataType.DATE)
    public firstViolationAt: Date;

    @Column(DataType.DATE)
    public lastViolationAt: Date;
}
