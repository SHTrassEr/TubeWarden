import {Table, Column,  Model, DataType} from "sequelize-typescript";


@Table({
    tableName: "statistics",
    timestamps: true
})
export default class Statistics extends Model<Statistics> {

    @Column
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