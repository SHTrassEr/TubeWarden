import sequelize from "../sequelize";

import SummaryService from "../core/service/summaryService";

const summaryService = new SummaryService();

sequelize.authenticate()
.then(async () => {
    await summaryService.initTable();
    await summaryService.updateAll();
})
.then(() => {
    sequelize.close();
});
