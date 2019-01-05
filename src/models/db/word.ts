import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import StemmedWord from "./stemmedWord";
import Video from "./video";
import VideoWord from "./videoWord";

@Table({
    tableName: "words",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
    indexes: [
        { unique: false, fields: ["title"] },
    ],
})
export default class Word extends Model<Word> {

    @Column({ primaryKey: true, autoIncrement: true })
    public id: number;

    @Column
    public title: string;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public videoCount: number;

    @ForeignKey(() => StemmedWord)
    @Column
    public stemmedWordId: number;

    @BelongsTo(() => StemmedWord)
    public stemmedWord: StemmedWord;

    @BelongsToMany(() => Video, () => VideoWord)
    public video: Video[];
}
