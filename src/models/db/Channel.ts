import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "channels",
    timestamps: true,
})
export default class Channel extends Model<Channel> {

    @Column({ primaryKey: true })
    public Id: string;

    @Column
    public title: string;

    @Column
    public videoCount: number;

    @Column
    public subscriberCount: number;

    @Column
    public trendsVideoCount: number;

    @Column
    public statisticsVideoCount: number;

    @Column
    public likeViolationCount: number;

    @Column
    public dislikeViolationCount: number;
}
