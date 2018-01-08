import {Table, Column,  Model, DataType} from "sequelize-typescript";


@Table({
    tableName: "channels",
    timestamps: true
})
export default class Channel extends Model<Channel> {

    @Column({ primaryKey: true })
    Id: string;

    @Column
    title: string;

    @Column
    videoCount: number;

    @Column
    subscriberCount: number;

    @Column
    trendsVideoCount: number;

    @Column
    statisticsVideoCount: number;

    @Column
    likeViolationCount: number;

    @Column
    dislikeViolationCount: number;
}