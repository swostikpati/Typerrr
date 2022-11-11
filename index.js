let express = require("express");
let wordsJSON = require("./words1k.json");
let bcrypt = require("bcrypt");

//creating an express app
let app = express();
app.use(express.json());

//declaring constants
const PORT = 3000;
const users = [];
const saltRounds = 10; //used for bcrypt hashing

//setting up an http server over the express app
let http = require("http");
let server = http.createServer(app);

//starting the server
server.listen(PORT, () => {
    console.log("listerning on port 3000");
})

//serving the public folder
app.use("/", express.static("public/page1"))

//integrating nedb and creating databases for user authentication and leaderboard
let datastore = require("nedb");
let highScoreDB = new datastore({ filename: "highScores.db", timestampData: false });
let usersDB = new datastore({ filename: "userAuth.db", timestampData: false });


//loading databases
highScoreDB.loadDatabase();
usersDB.loadDatabase();

//setting up sockets over the http server
let io = require("socket.io");
io = new io.Server(server);


//declaring variables
let tr = 0; //current room number
let rooms = {}; //stores data of all rooms
let newRoomFlag = true; //flag that denotes whether a new room should be created
let words; //stores a string of words that are sent to the clients as typing tests

//SOCKETS
//establishing socket connection with clients
io.sockets.on("connect", (socket) => {

    console.log("New connection:", socket.id);

    //checking for disconnection
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        rooms[socket.roomNo].cap--; //updating new capacity of the specific room

        //case where player disconnects before the race has started
        if (rooms[socket.roomNo].f) {
            io.sockets.to(rooms[socket.roomNo].n).emit("playerDropped");
            io.sockets.to(socket.roomNo).emit("liveRoomStatus", rooms[socket.roomNo].cap);
        }

        //case where player disconnects while the race is going on
        if (rooms[socket.roomNo].winners.length >= rooms[socket.roomNo].cap) {
            rooms[socket.roomNo].f = true;
            if (rooms[socket.roomNo].winners.length > 0) { //race finish scenario when the last player drops
                updateHighscoreDB(rooms[socket.roomNo].winners[0]); //updating the highscore DB
            }
            rooms[socket.roomNo].positions = {}; //resetting positions object
            io.sockets.to(socket.roomNo).emit("winners", rooms[socket.roomNo].winners); //the specific room is informed of the winners
            rooms[socket.roomNo].winners = []; //resetting winners array
            refreshLeaderboard(); //refreshing the leaderboard
        }
    })

    //user authentication
    socket.on("userAuth", (data) => {
        socket.userN = data.username; //obtaining the username from the data sent by the client
        let pswdH;
        let userExistsFlag = false; //checks if user profile already exists
        let loginStatusData;

        //checking if username is present in the database
        usersDB.find({ username: data.username }, (err, docs) => {
            //error handling
            if (err) {
                console.log("Error", err);
                userExistsFlag = false;

            }
            else {
                //case where username already exists
                if (docs.length > 0) {
                    pswdH = docs[0].password; //obtaining the password provided by the user
                    userExistsFlag = true;
                }
                else {
                    userExistsFlag = false; //case where the user profile is new
                }
            }

            //if user profile already exists
            if (userExistsFlag) {
                //decrypting the password and comparing with the password provided by the current user
                bcrypt.compare(data.pass, pswdH, (err, result) => {
                    //error handling
                    if (err) {
                        console.log("Error", err);
                    }
                    else {
                        //if password inputed matches the password in the database
                        if (result) {
                            console.log("successful login");
                            loginStatusData = "success";
                            io.sockets.to(socket.id).emit("loginStatus", loginStatusData); //successful login is emitted to the client
                        }
                        //if password doesn't match
                        else {
                            console.log("unsuccessful login");
                            loginStatusData = "failed";
                            io.sockets.to(socket.id).emit("loginStatus", loginStatusData); //unsuccessful login is emitted to the client
                        }
                    }
                });
            }
            //create a new user profile case
            else {
                //encrypt the password provided by the user
                bcrypt.hash(data.pass, saltRounds, (err, hash) => {
                    //error handling
                    if (err) {
                        console.log("Error", err);
                    }
                    //insert new user profile record (username and password) in the usersDB database
                    usersDB.insert({ username: data.username, password: hash }, (err, newDoc) => {
                        if (err) {
                            console.log("Error", err);
                        }
                        else {
                            console.log("New user profile created successfully");
                            loginStatusData = "successCreated";
                            //create a new record in the highScoreDB database for the new user 
                            highScoreDB.insert({ username: data.username, highscore: 0 }, (err, docs) => {
                                if (err) {
                                    console.log("Error", err);
                                }
                                else {
                                    console.log("Profile created in highscore db");
                                }
                            })
                            io.sockets.to(socket.id).emit("loginStatus", loginStatusData); //emit login status to the user
                        }

                    })

                });
            }

        })

    })
    //refresh the leaderboard on start
    refreshLeaderboard();

    //checking for empty rooms to put the new client in
    for (let i = 1; i <= tr; i++) {
        //checking both whehther as room is full and whether there is a race going on in the room
        if (rooms[i].cap < 4 && rooms[i].f) {
            socket.roomNo = rooms[i].n; // assigning the room number to the socket object
            rooms[i].cap++; //setting new room capacity
            newRoomFlag = false; //setting flag to false as there is no more a requirement to make a new room
            if (rooms[i].cap > 3) {
                io.sockets.to(rooms[i].n).emit("roomFull");
            }
            break;
        }
        //checking everytime a user joins if a room is full or not
        else {
            if (rooms[i].f) {
                io.sockets.to(rooms[i].n).emit("roomFull"); //if the race hasn't started yet, emitting to the user that they can now
            }
            newRoomFlag = true;
        }
    }
    //if all existing rooms are full
    if (newRoomFlag) {
        if (tr != 0) {
            io.sockets.to(rooms[tr].n).emit("roomFull");
        }
        tr++;
        socket.roomNo = tr;
        newRoomFlag = false; //resetting the flag
        rooms[tr] = { n: tr, f: true, cap: 1, winners: [], positions: {} }; //initializing a new room with the client
    }
    socket.join(socket.roomNo); //making the client officially join the room they are designated to
    io.sockets.to(socket.roomNo).emit("liveRoomStatus", rooms[socket.roomNo].cap); //providing the users with realtime status of the number of people in the room
    if (rooms[socket.roomNo].cap > 3) {
        io.sockets.to(socket.roomNo).emit("roomFull");
    }
    io.sockets.to(socket.roomNo).emit("roomData", socket.roomNo); //emitting the room number of the client

    //if any of the users in a room click the start race button
    socket.on("raceReady", () => {
        //creating a string of words to send to all the users
        words = "";
        for (let i = 0; i < 20; i++) {
            if (i == 19) {
                words = words + wordsJSON.words[Math.floor(Math.random() * (1000)) + 1]; //without space in the end
                break;
            }
            words = words + wordsJSON.words[Math.floor(Math.random() * (1000)) + 1] + " ";
        }
        rooms[socket.roomNo].f = false;
        io.sockets.to(socket.roomNo).emit("startRace", words); //emitting the string of words to the users in the specific room
    })

    //when users send in their current position of their index
    socket.on("indexUpdate", (data) => {
        rooms[socket.roomNo].positions[data.username] = data.posI;
        let count = 1; //used to store their current position in the race
        let others = []; //keeps the indexes of all other players
        for (let key in rooms[socket.roomNo].positions) {
            if (key != data.username && rooms[socket.roomNo].positions[key] > rooms[socket.roomNo].positions[data.username]) {
                count++; //incrementing the counter everytime someone's position is ahead of the current client - denotes overall position in race

            }
            if (key != data.username) {
                others.push(rooms[socket.roomNo].positions[key]);
            }

        }
        let positionUpdateData = {
            racePos: count,
            othersPos: others
        }
        io.sockets.to(socket.id).emit("positionUpdate", positionUpdateData); //emitting the data to the client
    })

    //when a client completes the typing race
    socket.on("raceFinish", (data) => {
        rooms[socket.roomNo].winners.push(data); //their username is pushed into the winners array of the specific room
        //the scenario where everyone connected has finished the race
        if (rooms[socket.roomNo].winners.length >= rooms[socket.roomNo].cap) {
            rooms[socket.roomNo].f = true; //denotes the room is again open for new clients (if capacity hasn't already been reached)
            updateHighscoreDB(rooms[socket.roomNo].winners[0]); //updates the highscore of the winner in the database
            rooms[socket.roomNo].positions = {}; //resetting the room
            io.sockets.to(socket.roomNo).emit("winners", rooms[socket.roomNo].winners); //emitting the current winners of the race to all the clients
            rooms[socket.roomNo].winners = []; //resetting the winners array
            refreshLeaderboard(); //refreshing the leaderboard
        }
    })


})


//FUNCTIONS
function updateHighscoreDB(winner) {

    //finds the winners record in the database
    highScoreDB.find({ username: winner }, (err, docs) => {
        let prevScore;
        if (err) {
            console.log("Error:", err);
        }
        else {
            console.log(docs);
            prevScore = docs[0].highscore; //obtains their previous score
            //incrementing the highscore of the user by 1 in the database
            highScoreDB.update({ username: docs[0].username }, { $set: { highscore: prevScore + 1 } }, { upsert: false }, (err, numReplaced) => {
                if (err) {
                    console.log("Error:", err);
                }
            });
        }
    })

}

function refreshLeaderboard() {
    //sending in all the records in the highscore database sorted in descending order
    highScoreDB.find({}).sort({ highscore: -1 }).exec((err, docs) => {
        if (err) {
            console.log("Error:", err);
        } else {
            io.sockets.emit("updateHighscores", { "highscores": docs }); //emitting the data to all the clients connected across all rooms
        }
    });
}
