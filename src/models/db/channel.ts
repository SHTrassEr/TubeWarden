import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";

import Video from "./video";

@Table({
    tableName: "channels",
    timestamps: true,
})
export default class Channel extends Model<Channel> {

    @Column({ primaryKey: true })
    public id: string;

    @Column
    public title: string;

    @Column
    public videoCount: number;

    @Column
    public subscriberCount: number;

    @Column
    public trendsVideoCount: number;

    @Column
    public statisticsVideoCount: number;

    @Column
    public likeViolationCount: number;

    @Column
    public dislikeViolationCount: number;

    @Column({ defaultValue: false })
    public deleted: boolean;

    @Column(DataType.DATE)
    public deletedAt: Date;

    @HasMany(() => Video)
    public videos: Video[];
}
