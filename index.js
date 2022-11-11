let express = require("express");
let wordsJSON = require("./words1k.json");
let bcrypt = require("bcrypt");

let app = express();
app.use(express.json());
const PORT = 3000;
const users = [];
const saltRounds = 10;

let http = require("http");
let server = http.createServer(app);

server.listen(PORT, () => {
    console.log("listerning on port 3000");
})

app.use("/", express.static("public/page1"))

let datastore = require("nedb");
let highScoreDB = new datastore({ filename: "highScores.db", timestampData: false });
let usersDB = new datastore({ filename: "userAuth.db", timestampData: false });

highScoreDB.loadDatabase();
usersDB.loadDatabase();

let io = require("socket.io");
io = new io.Server(server);


//variables
let tr = 0; //current room number
let rooms = {};
let newRoomFlag = true;
let words;


io.sockets.on("connect", (socket) => {

    console.log("New connection:", socket.id);

    //checking disconnection of the specific socket
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        rooms[socket.roomNo].cap--;
        if (rooms[socket.roomNo].f) {
            io.sockets.to(rooms[socket.roomNo].n).emit("playerDropped");
            io.sockets.to(socket.roomNo).emit("liveRoomStatus", rooms[socket.roomNo].cap);
        }
        if (rooms[socket.roomNo].winners.length >= rooms[socket.roomNo].cap) {
            rooms[socket.roomNo].f = true;
            if (rooms[socket.roomNo].winners.length > 0) {
                updateHighscoreDB(rooms[socket.roomNo].winners[0]);
            }
            rooms[socket.roomNo].positions = {};
            io.sockets.to(socket.roomNo).emit("winners", rooms[socket.roomNo].winners);
            rooms[socket.roomNo].winners = [];
            refreshLeaderboard();
        }
    })

    socket.on("userAuth", (data) => {
        socket.userN = data.username;
        let pswdH;
        let userExistsFlag = false;
        let loginStatusData;


        usersDB.find({ username: data.username }, (err, docs) => {
            if (err) {
                console.log("Error", err);
                userExistsFlag = false;

            }
            else {
                if (docs.length > 0) {
                    pswdH = docs[0].password;
                    userExistsFlag = true;
                }
                else {
                    userExistsFlag = false;
                }
            }

            if (userExistsFlag) {
                bcrypt.compare(data.pass, pswdH, (err, result) => {
                    if (err) {
                        console.log("Error", err);
                    }
                    // result == true
                    else {
                        if (result) {
                            console.log("successful login");
                            loginStatusData = "success";
                            io.sockets.to(socket.id).emit("loginStatus", loginStatusData);
                        }
                        else {
                            console.log("unsuccessful login");
                            loginStatusData = "failed";
                            io.sockets.to(socket.id).emit("loginStatus", loginStatusData);
                        }
                    }
                });
            }
            else {
                bcrypt.hash(data.pass, saltRounds, (err, hash) => {
                    // Store hash in your password DB.
                    if (err) {
                        console.log("Error", err);
                    }
                    usersDB.insert({ username: data.username, password: hash }, (err, newDoc) => {
                        if (err) {
                            console.log("Error", err);
                        }
                        else {
                            console.log("New user profile created successfully");
                            loginStatusData = "successCreated";
                            highScoreDB.insert({ username: data.username, highscore: 0 }, (err, docs) => {
                                if (err) {
                                    console.log("Error", err);
                                }
                                else {
                                    console.log("Profile created in highscore db");
                                }
                            })
                            io.sockets.to(socket.id).emit("loginStatus", loginStatusData);
                        }

                    })

                });
            }

        })

    })
    refreshLeaderboard();

    //reference: https://sebhastian.com/javascript-wait-for-function-to-finish/

    for (let i = 1; i <= tr; i++) {
        if (rooms[i].cap < 4 && rooms[i].f) {
            socket.roomNo = rooms[i].n;
            rooms[i].cap++;
            newRoomFlag = false;
            if (rooms[i].cap > 3) {
                io.sockets.to(rooms[i].n).emit("roomFull");
            }
            break;
        }
        else {
            if (rooms[i].f) {
                io.sockets.to(rooms[i].n).emit("roomFull");
            }
            newRoomFlag = true;
        }
    }
    if (newRoomFlag) {
        if (tr != 0) {
            io.sockets.to(rooms[tr].n).emit("roomFull");
        }
        tr++;
        socket.roomNo = tr;
        newRoomFlag = false;
        rooms[tr] = { n: tr, f: true, cap: 1, winners: [], positions: {} };
    }
    socket.join(socket.roomNo);
    io.sockets.to(socket.roomNo).emit("liveRoomStatus", rooms[socket.roomNo].cap);
    if (rooms[socket.roomNo].cap > 3) {
        io.sockets.to(socket.roomNo).emit("roomFull");
    }
    io.sockets.to(socket.roomNo).emit("roomData", socket.roomNo);

    socket.on("raceReady", () => {
        words = ""
        for (let i = 0; i < 20; i++) {
            if (i == 19) {
                words = words + wordsJSON.words[Math.floor(Math.random() * (1000)) + 1]; //without space in the end
                break;
            }
            words = words + wordsJSON.words[Math.floor(Math.random() * (1000)) + 1] + " ";
        }
        rooms[socket.roomNo].f = false;
        io.sockets.to(socket.roomNo).emit("startRace", words);
    })

    socket.on("indexUpdate", (data) => {
        rooms[socket.roomNo].positions[data.username] = data.posI;
        let count = 1;
        let others = []
        for (let key in rooms[socket.roomNo].positions) {
            if (key != data.username && rooms[socket.roomNo].positions[key] > rooms[socket.roomNo].positions[data.username]) {
                count++;

            }
            if (key != data.username) {
                others.push(rooms[socket.roomNo].positions[key]);
            }

        }
        let positionUpdateData = {
            racePos: count,
            othersPos: others
        }
        io.sockets.to(socket.id).emit("positionUpdate", positionUpdateData);
    })

    socket.on("raceFinish", (data) => {
        rooms[socket.roomNo].winners.push(data);
        if (rooms[socket.roomNo].winners.length >= rooms[socket.roomNo].cap) {
            rooms[socket.roomNo].f = true;
            updateHighscoreDB(rooms[socket.roomNo].winners[0]);
            rooms[socket.roomNo].positions = {};
            io.sockets.to(socket.roomNo).emit("winners", rooms[socket.roomNo].winners);
            rooms[socket.roomNo].winners = [];
            refreshLeaderboard();
        }
    })


})


function updateHighscoreDB(winner) {

    highScoreDB.find({ username: winner }, (err, docs) => {
        let prevScore;
        if (err) {
            console.log("Error:", err);
        }
        else {
            console.log(docs);
            prevScore = docs[0].highscore;
            highScoreDB.update({ username: docs[0].username }, { $set: { highscore: prevScore + 1 } }, { upsert: false }, (err, numReplaced) => {
                if (err) {
                    console.log("Error:", err);
                }
            });
        }
    })

}

function refreshLeaderboard() {
    highScoreDB.find({}).sort({ highscore: -1 }).exec((err, docs) => {
        if (err) {
            console.log("Error:", err);
        } else {
            io.sockets.emit("updateHighscores", { "highscores": docs });
        }
    });
}
