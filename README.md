# Roll-On
Connections Lab Midterm Project

Run the following code:
```
npm install
npm start
```
## Project Concept & Idea

We want to create a multiplayer browser-based online typing game. In this game, players pass types of a set of different texts as quickly as possible, competing with themselves or with other online users simultaneously. For racing, there is the default  option, where players race against each other by typing randomly selected words from a database. We will use p5.js to create the animation of racing cars (or maybe rolling balls) based on the real-time average words per minute (wpm) count of each player. When typing text selections, accuracy is required; any typing errors detected in spelling, capitalization or punctuation must be fixed by the player before continuing with the race. The real-time server client connections will be made using socket.io. We also have plans of adding additional user authentication to create user profiles so as to track the highscores (number of wins and best wpm). This will be achieved by incorporating a database (preferably in NeDB/MongoDB). 

## Inspiration

Games like Nitrotype, 10fastfingers, keybr. The primary motivation behind making this game is to allow people to improve their typing skills through a fun and interactive game where they can challenge their friends to a typing race. 

## Wireframe of the game

![](images/1.png)

