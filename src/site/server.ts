import sequelize from "../sequelize";
import * as http from "http";
import { app }  from "./app";


var server: http.Server = http.createServer(app);

var port: number = app.get("port");

sequelize.sync()
.then(() => {
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