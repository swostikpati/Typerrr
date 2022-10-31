let express = require("express");
let app = express();
app.use(express.json());
const PORT = 3000;

let http = require("http");
let server = http.createServer(app);

server.listen(PORT, () => {
    console.log("listerning on port 3000");
})

app.use("/", express.static("public/page1"))

let io = require("socket.io");
io = new io.Server(server);

io.sockets.on("connect", (socket) => {
    console.log("New connection:", socket.id);

    //checking disconnection of the specific socket
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
    })
})

let datastore = require("nedb");
let db = new datastore({ filename: "highscores.db", timestampData: true });

db.loadDatabase();