let socket = io(); //establishes connection with the socket server

//variables
let raceFlag = false;
let words;
let index = 0;
let userN = "";
let userP = "";
// let userAuthFlag = true;
let userAuthData;
// let othersPosArr = [];

//DOM elements
const start_bt = document.querySelector("#start-bt");
const pre_start = document.querySelector(".pre-start");
const race_time = document.querySelector(".race-time");
const text_area = document.querySelector(".text-area");
const untyped = document.querySelector(".untyped");
const typed_corr = document.querySelector(".typed-corr");
const typed_wr = document.querySelector(".typed-wr");
const end_screen = document.querySelector(".end-screen");
const curr_pos = document.querySelector(".curr-pos");
const waiting = document.querySelector(".waiting");
const pos1 = document.querySelector(".pos1");
const pos2 = document.querySelector(".pos2");
const pos3 = document.querySelector(".pos3");
const pos4 = document.querySelector(".pos4");
const restart_bt = document.querySelector("#restart-bt");

userAuthCheck();


//client acknowledging after server confirmation - connect is a keyword
socket.on("connect", () => {
    console.log("Connection established to server via sockets");
    socket.on("roomData", (data) => {
        console.log("Room joined:", data);
    })

})

socket.on("loginStatus", (data) => {
    if (data == "success") {
        alert("Logged in successfully!");
    }
    if (data == "failed") {
        alert("Login Failed! Username already exists or Password Error.")
        userN = "";
        userP = "";
        userAuthCheck();
    }
    if (data == "successCreated") {
        alert("New user profile created and logged in successfully!");
    }

})

socket.on("roomFull", () => {
    // roomFull = data;
    console.log("yes");
    start_bt.disabled = false;
})

socket.on("startRace", (data) => {
    pre_start.style.display = "none";
    race_time.style.display = "block";
    words = data;
    console.log(words);
    untyped.innerHTML += words;
    raceFlag = true;
})

socket.on("winners", (data) => {
    console.log(data);
    waiting.innerHTML = "";
    pos1.innerHTML += data[0];
    pos2.innerHTML += data[1];
    pos3.innerHTML += data[2];
    pos4.innerHTML += data[3];

})

socket.on("positionUpdate", (data) => {
    console.log(data.racePos);
    curr_pos.innerText = `${data.racePos}/4`;
    // othersPosArr = data.othersPos;
    // positionRefresh(othersPosArr);
    data.othersPos.sort(function (a, b) { return a - b }); //the most important line to remember ever

    let arrCorr = [];
    let arrUn = [];
    for (let i = 0; i < data.othersPos.length; i++) {
        let othersPos = data.othersPos[i];

        if (othersPos >= index && othersPos < words.length) {
            //show in uptyped part
            // untyped.innerHTML = untyped.innerHTML.slice(index, othersPos) + `<span class="cursor">|</span>` + untyped.innerHTML.slice(othersPos);
            // untyped.innerHTML = words.slice(index, othersPos) + `<span class="cursor">|</span>` + words.slice(othersPos);
            arrUn.push(othersPos);

        }
        else if (othersPos < index) {
            arrCorr.push(othersPos);
            //show in typed part
            // typed_corr.innerHTML = typed_corr.innerHTML.slice(0, othersPos) + `<span class="cursor">|</span>` + typed_corr.innerHTML.slice(othersPos, index);
            // typed_corr.innerHTML = words.slice(0, othersPos) + `<span class="cursor">|</span>` + words.slice(othersPos, index);
        }
        // untyped.innerHTML = words.slice(index, othersPos) + `<span class="cursor">|</span>` + words.slice(othersPos);
        // arrCorr.sort();
        // arrUn.sort();
    }
    console.log(arrCorr);
    console.log(arrUn);
    if (arrCorr[0]) {
        typed_corr.innerHTML = words.slice(0, arrCorr[0]) + `<span class="cursor1">|</span>`;
        for (let i = 0; i < arrCorr.length - 1; i++) {
            typed_corr.innerHTML += words.slice(arrCorr[i], arrCorr[i + 1]) + `<span class="cursor1">|</span>`; //change 2
        }
        typed_corr.innerHTML += words.slice(arrCorr[arrCorr.length - 1], index);
    }
    else {
        typed_corr.innerHTML = words.slice(0, index);
    }

    if (arrUn[0]) {
        untyped.innerHTML = `<span class="cursor">|</span>` + words.slice(index, arrUn[0]);
        for (let i = 0; i < arrUn.length - 1; i++) {
            untyped.innerHTML += `<span class="cursor1">|</span>` + words.slice(arrUn[i], arrUn[i + 1]);

        }
        untyped.innerHTML += `<span class="cursor1">|</span>` + words.slice(arrUn[arrUn.length - 1]); //last change
    }


})

socket.on("playerDropped", () => {
    console.log("yes1");
    start_bt.disabled = true;
})


start_bt.addEventListener("click", () => {
    socket.emit("raceReady");
})


//added keypress event - reference "https://www.section.io/engineering-education/keyboard-events-in-javascript/"
document.addEventListener('keypress', (e) => {
    // var name = event.key;
    // var code = event.code;
    // // Alert the key name and key code on keydown
    // console.log(`Key pressed ${name} \r\n Key code value: ${code}`);
    // let key = event.key;
    if (raceFlag) {
        changeCol(checkKey(e.key));
    }
}, false);

// restart_bt.addEventListener("click", () => {
//     //socket.emit("raceOver")
// })


function checkKey(key) {
    // console.log(key + ", ", words[index]);
    if (index < words.length && key == words[index]) {
        index++;
        let indexData = {
            username: userN,
            posI: index
        }
        socket.emit("indexUpdate", indexData);
        return true;
    }
    return false;
}

function changeCol(corr) {
    if (corr) {
        //turn green
        typed_wr.innerHTML = "";
        typed_corr.innerHTML += words[index - 1];
        untyped.innerHTML = `<span class="cursor">|</span>` + words.slice(index);
        //positionRefresh(othersPosArr);
        //typed_corr.innerText == words
        if (index == words.length) {

            console.log("race finished");
            raceFlag = false;
            race_time.style.display = "none";
            end_screen.style.display = "block";
            socket.emit("raceFinish", userN);
        }


    }
    else {

        // else {
        //turn red
        typed_wr.innerHTML = `<span class="cursor">|</span>` + words[index];
        untyped.innerHTML = words.slice(index + 1);
        //positionRefresh(othersPosArr);
        // }


    }

}

function userAuthCheck() {
    while (userN == "" || userN == null) {
        userN = prompt("Please enter your username:");
        console.log(userN);
    }
    while (userP == "" || userP == null) {
        userP = prompt("Please enter your password:");
    }


    userAuthData = {
        username: userN,
        pass: userP
    }

    socket.emit("userAuth", userAuthData);
}

// function positionRefresh(othersPos) {
//     othersPos.sort();

//     let i = 0;
//     let prevI = 0;
//     if (othersPos[i] < index) {
//         typed_corr.innerHTML = "";
//     }
//     else {
//         typed_corr.innerHTML = words.slice(0, index);
//     }
//     while (othersPos[i] < index) {
//         typed_corr.innerHTML += words.slice(prevI, othersPos[i]) + `<span class="cursor">|</span>`;
//         prevI = othersPos[i];
//         i++;
//         if (othersPos[i] >= index) {
//             typed_corr.innerHTML += words.slice(prevI, index);
//             prevI = index;
//         }
//     }

//     if (i < othersPos.length) {
//         // if (typed_wr.innerHTML == "") {
//         //     untyped.innerHTML = `<span class="cursor">|</span>`;
//         // }
//         // else {
//         //     untyped.innerHTML = "";
//         // }
//         untyped.innerHTML = "";
//     }
//     else {
//         untyped.innerHTML = words.slice(index);
//     }

//     while (i < othersPos.length) {
//         //add if check for wrong scenario
//         untyped.innerHTML += words.slice(index, othersPos[i]) + `<span class="cursor">|</span>`;
//         prevI = othersPos[i];
//         i++;
//         if (i >= othersPos.length) {
//             untyped.innerHTML += words.slice(prevI);
//         }
//     }

//     // }
// }
//use while loop to loop till the end of the string
//use spans for color
//use z-index for cursor
//everytime the index changes - emit to the server based on which current position will be known
//add the check where one person leaves in the middle of the race...timeout

//if someone exits before start...disable start

//one way that might work is to give a class to the cursor specifically and animating it in css
//fix the case where all four are activated

//user authentication
//database for highscores and user profiles
//styling
//going back to the main page
//add wpm