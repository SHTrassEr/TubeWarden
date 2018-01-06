import {Table, Column,  Model, DataType} from "sequelize-typescript";


@Table( {
    tableName: "videos",
    timestamps: true,
    indexes:[
        { unique: false, fields:["deleted", "nextStatisticsUpdateAt"] },
        { unique: false, fields:["trendsAt"]}
    ]
})
export default class Video extends Model<Video> {

    @Column({ primaryKey: true })
    videoId: string;

    @Column(DataType.TEXT)
    title: string;

    @Column(DataType.DATE)
    publishedAt: Date;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    likeCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    dislikeCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    viewCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    likeViolationCnt: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    dislikeViolationCnt: number;

    @Column({ defaultValue: false })
    deleted: boolean;

    @Column(DataType.DATE)
    deletedAt: Date;

    @Column(DataType.DATE)
    lastViolationAt: Date;

    @Column(DataType.DATE)
    statisticsUpdatedAt: Date;

    @Column(DataType.DATE)
    nextStatisticsUpdateAt: Date;

    @Column(DataType.DATE)
    trendsAt: Date;
}
