import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";

import Channel from "./channel";
import Tag from "./tag";
import VideoTag from "./videoTag";

@Table( {
    tableName: "videos",
    timestamps: true,
    indexes: [
        { unique: false, fields: ["deleted", "nextStatisticsUpdateAt"] },
        { unique: false, fields: ["trendsAt"] },
        { unique: false, fields: ["channelId"] },
    ],
})
export default class Video extends Model<Video> {

    @Column({ primaryKey: true })
    public videoId: string;

    @Column(DataType.TEXT)
    public title: string;

    @Column(DataType.DATE)
    public publishedAt: Date;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public likeCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public dislikeCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public viewCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public likeViolationCnt: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public dislikeViolationCnt: number;

    @Column({ defaultValue: false })
    public deleted: boolean;

    @Column(DataType.DATE)
    public deletedAt: Date;

    @Column(DataType.DATE)
    public lastViolationAt: Date;

    @Column(DataType.DATE)
    public statisticsUpdatedAt: Date;

    @Column(DataType.DATE)
    public nextStatisticsUpdateAt: Date;

    @Column(DataType.DATE)
    public trendsAt: Date;

    @ForeignKey(() => Channel)
    @Column
    public channelId: string;

    @BelongsTo(() => Channel, "channelId")
    public channel: Channel;

    @BelongsToMany(() => Tag, () => VideoTag, "videoId")
    public tags: Tag[];

    public isViolated(): boolean {
        if (this.lastViolationAt) {
            return true;
        }

        return false;
    }
}
