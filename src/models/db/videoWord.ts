import { BelongsToMany, Column, DataType, ForeignKey,  Model, Table } from "sequelize-typescript";
import Video from "./video";
import Word from "./word";

@Table({
    tableName: "video_word",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
})
export default class VideoWord extends Model<VideoWord> {

    @ForeignKey(() => Video)
    @Column
    public videoId: string;

    @ForeignKey(() => Word)
    @Column
    public wordId: number;
}
