import {Table, Column,  Model, DataType} from "sequelize-typescript";


@Table({
    tableName: "statistics",
    timestamps: true
})
export default class Statistics extends Model<Statistics> {

    @Column
    viewCount: number;

    @Column({allowNull: true})
    likeCount: number;

    @Column({allowNull: true})
    dislikeCount: number;

    @Column({allowNull: true})
    commentCount: number;

    @Column({ primaryKey: true })
    videoId: string;

    @Column({ primaryKey: true })
    createdAt: Date;

}