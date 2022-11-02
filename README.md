# Typerrr
Connections Lab Midterm Project

## Project Concept & Idea

We want to create a multiplayer browser-based online typing game. In this game, players pass tests of a set of different texts as quickly as possible, competing with themselves or with other online users.

## Wireframe of the game

This is the [initial wireframe](https://github.com/swostikpati/Typerrr/blob/main/Wireframe_Typerrr.pdf) of the project.

## Information Flow

• An express app is created

• An HTTP server is created over the express app

• Socket.io is added over the HTTP server

• A database is setup with Bcrypt to store the username and passwords of users and also their highscores (total number of wins and highest words per minute)

• The client initiates a connection to the server by either registering or logging in

• For new users the server first stores the login information in the database.

• For returning users, the server authenticates the information and then either recognizes the client connection or denies the connection

• The client on receiving confirmation of connection from the server, acknowledges it.

• The server waits for three simultaneous connections before starting the race. On receiving three simultaneous connections, the server puts all of them into a unique room where they can race. 

• On receiving more than three connections, the server makes multiple of those rooms with three simultaneous clients in each.

• The race begins with the words to be typed being displayed on the screen of each of the users. The words are taken from the 1k most used english words API. 

• The server keeps updating the progress of each of the racing clients in real-time (by showcasing the position of their cursor on the screen) and also updates their position in the race which is displayed in the top.

• As soon as the race ends, the current positions of each of the clients displayed and a win is registered against the person who comes first. 

Run the following code:
```
npm install
npm start
```

