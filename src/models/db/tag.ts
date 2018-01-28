import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import Video from "./video";
import VideoTag from "./videoTag";

@Table({
    tableName: "tags",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
    indexes: [
        { unique: false, fields: ["title"] },
    ],
})
export default class Tag extends Model<Tag> {

    @Column({ primaryKey: true, autoIncrement: true })
    public id: number;

    @Column
    public title: string;

    @BelongsToMany(() => Video, () => VideoTag, "tagId")
    public video: Video[];
}
