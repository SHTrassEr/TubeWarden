import { BelongsTo, Column, DataType, ForeignKey,  Model, Table } from "sequelize-typescript";
import StemmedWord from "./stemmedWord";

@Table({
    tableName: "trend_stemmed_word",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
})
export default class TrendStemmedWord extends Model<TrendStemmedWord> {

    @Column({ primaryKey: true, allowNull: false, type: DataType.DATE })
    public date: Date;

    @ForeignKey(() => StemmedWord)
    @Column({ primaryKey: true, allowNull: false, type: DataType.INTEGER })
    public stemmedWordId: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public videoCount: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public added: number;

    @Column({type: DataType.INTEGER, defaultValue: 0})
    public removed: number;

    @BelongsTo(() => StemmedWord)
    public stemmedWord: StemmedWord;
}
