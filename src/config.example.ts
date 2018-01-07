export default class Config {

    public static Url = "http://localhost:3000/";

    public static Database = {
        database: "youtubewarden",
        username: "youtubewarden_admin",
        password: "youtubewarden_admin",
        dialect: "mysql",
        host: "127.0.0.1",
        port: 3306,
        dialectOptions: {
            supportBigNumbers: true,
            bigNumberStrings: true,
            charset: "utf8mb4",
            collate: "utf8mb4_unicode_ci"
        },

        debug: true
    };

    public static Server = {
        host: "127.0.0.1",
        port: "3000"
    };

    public static Service = {
        trends: {
            cron: "*/5 * * * *"
        },
        statistics: {
            cron: "*/10 * * * * *",
            update: {
                delayMin: 2,
                delayMax: 20,
                lowDealyAt: 60 * 22 ,
                endAt: 2 * 60 * 24
            }
        }
    };

    public static SSL = {
        key: __dirname + "/../../cert/TubeWarden/private.key",
        cert: __dirname + "/../../cert/certificate.crt",
        ca: __dirname + "/../../cert/ca_bundle.pem",
    };

    public static Google = {
        key: "KEY",
        regionCode: "ru",
        maxResults: 50
    };
}
