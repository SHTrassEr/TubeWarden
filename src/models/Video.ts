import {Table, Column,  Model, DataType} from "sequelize-typescript";


@Table( {
    tableName: "videos",
    timestamps: true,
    indexes:[{ unique: false, fields:["nextStatisticsUpdateAt"]}]
})
export default class Video extends Model<Video> {

    @Column({type: DataType.BIGINT, primaryKey: true})
    videoId: string;

    @Column(DataType.TEXT)
    title: string;

    @Column(DataType.DATE)
    publishedAt: Date;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    likeViolationCnt: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    dislikeViolationCnt: number;

    @Column(DataType.DATE)
    lastViolationAt: Date;

    @Column(DataType.DATE)
    statisticsUpdatedAt: Date;

    @Column(DataType.DATE)
    nextStatisticsUpdateAt: Date;
}
