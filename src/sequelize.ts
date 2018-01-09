import { Sequelize } from "sequelize-typescript";
import Config from "./config";

const sequelize: Sequelize = new Sequelize(Config.Database);
sequelize.addModels([__dirname + "/models/db"]);
export default sequelize;
