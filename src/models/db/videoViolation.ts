import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";

import Video from "./video";

@Table( {
    tableName: "video_violation",
    timestamps: false,
    indexes: [
    ],
})

export default class VideoViolation extends Model<VideoViolation> {

    @ForeignKey(() => Video)
    @Column({ primaryKey: true })
    public videoId: string;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public maxAnglePositiveLike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public sumAnglePositiveLike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public maxAngleNegativeLike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public sumAngleNegativeLike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public maxAnglePositiveDislike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public sumAnglePositiveDislike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public maxAngleNegativeDislike: number;

    @Column({type: DataType.FLOAT, defaultValue: 0})
    public sumAngleNegativeDislike: number;
}
