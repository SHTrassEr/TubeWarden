import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasOne, Model, Table } from "sequelize-typescript";

import Channel from "./channel";
import StemmedWord from "./stemmedWord";
import Tag from "./tag";
import VideoStemmedWord from "./videoStemmedWord";
import VideoTag from "./videoTag";
import VideoViolationDislike from "./videoViolationDislike";
import VideoViolationLike from "./videoViolationLike";
import VideoWord from "./videoWord";
import Word from "./word";

@Table( {
    tableName: "videos",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: true,
    indexes: [
        { unique: false, fields: ["nextStatisticsUpdateAt"] },
        { unique: false, fields: ["trendsAt", "createdAt"] },
        { unique: false, fields: ["createdAt"] },
        { unique: false, fields: ["channelId", "createdAt"] },
        { unique: false, fields: ["violationIndexLike", "createdAt"] },
        { unique: false, fields: ["violationIndexDislike", "createdAt"] },
    ],
})
export default class Video extends Model<Video> {

    @Column({ primaryKey: true, allowNull: false })
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
    public violationIndexLike: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public violationIndexDislike: number;

    @Column({ defaultValue: false })
    public deleted: boolean;

    @Column(DataType.DATE)
    public deletedAt: Date;

    @Column(DataType.DATE)
    public statisticsUpdatedAt: Date;

    @Column(DataType.DATE)
    public nextStatisticsUpdateAt: Date;

    @Column(DataType.DATE)
    public trendsAt: Date;

    @ForeignKey(() => Channel)
    @Column
    public channelId: string;

    @HasOne(() => VideoViolationLike)
    public violationLike: VideoViolationLike;

    @HasOne(() => VideoViolationDislike)
    public violationDislike: VideoViolationDislike;

    @BelongsTo(() => Channel)
    public channel: Channel;

    @BelongsToMany(() => Tag, () => VideoTag)
    public tags: Tag[];

    @BelongsToMany(() => StemmedWord, () => VideoStemmedWord)
    public stemmedWords: StemmedWord[];

    @BelongsToMany(() => Word, () => VideoWord)
    public words: Word[];
}
