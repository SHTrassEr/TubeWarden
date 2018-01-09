import Video from "../models/db/Video";
import sequelize from "../sequelize";

sequelize.sync()
    .then(() => {
        Video.findAll()
        .then((vl) => {
            sequelize.close();
        });
    });
