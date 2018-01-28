import { BelongsToMany, Column, DataType, ForeignKey,  Model, Table } from "sequelize-typescript";
import Tag from "./tag";
import Video from "./video";

@Table({
    tableName: "video_tag",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
})
export default class VideoTag extends Model<VideoTag> {

    @ForeignKey(() => Video)
    @Column
    public videoId: string;

    @ForeignKey(() => Tag)
    @Column
    public tagId: number;
}
