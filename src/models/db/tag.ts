import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import Video from "./video";
import VideoTag from "./videoTag";

@Table({
    tableName: "tags",
    timestamps: false,
    indexes: [
        { unique: false, fields: ["title"] },
    ],
})
export default class Tag extends Model<Tag> {

    @Column({ primaryKey: true, autoIncrement: true })
    public videoId: number;

    @Column
    public title: string;

    @BelongsToMany(() => Video, () => VideoTag, "tagId")
    public video: Video[];
}
