import Config from "./config";
import { Sequelize } from "sequelize-typescript";

var sequelize: Sequelize = new Sequelize(Config.Database);
sequelize.addModels([__dirname + "/models/db"]);
export default sequelize;
