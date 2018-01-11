import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import Video from "./video";
import VideoTag from "./videoTag";

@Table({
    tableName: "summary",
    timestamps: false,
})
export default class Summary extends Model<Summary> {

    @Column({ primaryKey: true })
    public id: string;

    @Column
    public value: number;
}
