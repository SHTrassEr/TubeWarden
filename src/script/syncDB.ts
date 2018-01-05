import sequelize from "../sequelize";
import Video from "../models/db/Video";

sequelize.sync()
    .then(() => {

        Video.findAll()
        .then((vl) => {
            sequelize.close();
        });
    })
    .catch(err => {
        console.error(err);
        sequelize.close();
    });
