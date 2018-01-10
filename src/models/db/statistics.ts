import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "statistics",
    timestamps: true,
})
export default class Statistics extends Model<Statistics> {

    @Column
    public  viewCount: number;

    @Column({allowNull: true})
    public likeCount: number;

    @Column({allowNull: true})
    public dislikeCount: number;

    @Column({allowNull: true})
    public commentCount: number;

    @Column({ primaryKey: true })
    public videoId: string;

    @Column({ primaryKey: true })
    public createdAt: Date;

}
