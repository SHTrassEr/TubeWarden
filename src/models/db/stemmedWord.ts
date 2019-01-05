import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Video from "./video";
import VideoStemmedWord from "./videoStemmedWord";
import Word from "./word";

@Table({
    tableName: "stemmed_words",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
    indexes: [
        { unique: false, fields: ["title"] },
    ],
})
export default class StemmedWord extends Model<StemmedWord> {

    @Column({ primaryKey: true, autoIncrement: true })
    public id: number;

    @Column
    public title: string;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public videoCount: number;

    @BelongsToMany(() => Video, () => VideoStemmedWord)
    public video: Video[];

    @HasMany(() => Word)
    public word: Word[];
}
