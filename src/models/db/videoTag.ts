import { BelongsToMany, Column, DataType, ForeignKey,  Model, Table } from "sequelize-typescript";
import Tag from "./tag";
import Video from "./video";

@Table({
    tableName: "video_tag",
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
