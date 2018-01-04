import {Table, Column,  Model, DataType} from "sequelize-typescript";


@Table({
    tableName: "statistics",
    timestamps: true,
    indexes:[{ unique: false, fields:["videoId"]}]
})
export default class Statistics extends Model<Statistics> {

    @Column(DataType.BIGINT)
    viewCount: number;

    @Column
    likeCount: number;

    @Column
    dislikeCount: number;

    @Column
    commentCount: number;

    @Column({ primaryKey: true })
    videoId: string;

    @Column({ primaryKey: true })
    createdAt: Date;

}