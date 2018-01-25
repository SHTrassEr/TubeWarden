import { BelongsToMany, Column, DataType, ForeignKey,  Model, Table } from "sequelize-typescript";
import StemmedWord from "./stemmedWord";
import Video from "./video";

@Table({
    tableName: "video_stemmed_word",
    timestamps: false,
})
export default class VideoStemmedWord extends Model<VideoStemmedWord> {

    @ForeignKey(() => Video)
    @Column
    public videoId: string;

    @ForeignKey(() => StemmedWord)
    @Column
    public stemmedWordId: number;
}
