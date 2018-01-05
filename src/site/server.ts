import sequelize from "../sequelize";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as net from "net";

import { app }  from "./app";
import Config from "../config";


var sslConf: any = null;

if(Config.SSL.key && fs.existsSync(Config.SSL.key)) {
    sslConf = {
        key : fs.readFileSync(Config.SSL.key),
        cert : fs.readFileSync(Config.SSL.cert),
        ca : fs.readFileSync(Config.SSL.ca)
    };
}

var port: number = app.get("port");
var server: net.Server  = null;

sequelize.sync()
.then(() => {
    if(sslConf) {
        port = 443;
        server = https.createServer(sslConf, app);
    } else {
        server = http.createServer(app);
    }

    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);
});



function onListening(): void {
    var addr: any = server.address();
    var bind: string = (typeof addr === "string")
      ? "pipe " + addr
      : "port " + addr.port;
    console.log("Listening on " + bind);
}

function onError(error: any): void {
    if (error.syscall !== "listen") {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
        console.error(port + " requires elevated privileges");
        process.exit(1);
        break;
        case "EADDRINUSE":
        console.error(port + " is already in use");
        process.exit(1);
        break;
        default:
        throw error;
    }
}