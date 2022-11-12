# Typerrr.com

Working Link: https://typerrr.glitch.me

## Project Description

### Overview

Typerrr is an online multiplayer type-racing game, where people simultaneously finish typing tests (derived from the 1000 most spoken English words database), while competing with each other and seeing the cursor positions of all players in realtime. Our project uses Socket.io for realtime multiplayer connections, NeDB database to store user profiles and highscores, and Bcrypt for user authentication and login. The video below showcases the working of the entire website:

/Video

### Inspiration and Target Audience

Typing tests and comparing typing speeds ia pretty common thing among people especially those in university. This might feel like a very unusual thing to do, but it does happen. While on the other hand there is a also a large audience that are completely unaware of it such things existing. Surprisingly, most of the university students type at speeds above 50 wpm without even realizing it (and many a times not even touch typing). But needless to say that the skill of touch typing is very beneficial and improving in it can help people greatly in this tech-filled world. What's more? It looks pretty cool. 

Now even though typing test applications do exist, but they come with a lot of problems. The interface of these applications is filled with elements that are very distracting to the person typing. Even some of the most popular ones like [10fastfingers](https://10fastfingers.com/) have extremely basic UI and UX designs that don't give a sense of satisfaction to the user. Typing is a very basic task and improving the user experience can help keep the user encouraged enough to keep doing the activity. On the other side are racing games for typing. These pose a different problem. Some of them are very buggy and rough like [TypeRacer](https://play.typeracer.com/) to begin with. The good ones with really great animation like [Nitro Type](https://www.nitrotype.com/) focus way too much on the race than the activity driving the race. The race element, even though is more addictive and gives the users the motibation to keep at the activitiy, they pose the problem of distracting the user a lot from the actual typing and therefore causing a negative effect on their typing.

One of the best applications for typing online that currently exists is [MonkeyType](https://monkeytype.com/). The UI is clean and  amazing with a wide array of color themes for the user. The elements of user experience especially the animation of the cursor moving through the text rapidly enhance the engagement of the user. The only downside: it was just a typing test and not a typing race.  

Why do we need a race element though? What we have realized after testing the pre-existing typing applications with several people is that the people have a sense of winning in case of a gamified experience like a typing race. We have observed that they push themselves harder and type faster at key moments when there is an opportunity to get ahead of someone else in the race. This is what makes them better typers with better speeds as they continue to push themselves and hit higher speeds.

All in all our goal was to combnine all the good elements of typing races and tests, minimize distractions, and enhance the user experience of the application. Our target audience is anyone who wishes to improve their typing, especially university students and working professionals, and do so in a more fun and encouraging way.

### Concept

Our concept was to make a gamified experience for typing by adding a non-distracting element of a race. To do this we brainstormed on a number of ideas. We initially had a car race in mind. Since similar applications already existed. To add a unique element to the game, we thought of going forward with balls rolling (like a race) or something in those terms. But as mentioned above, these traditional races have a huge element of distraction and cause the users to lose focus on the typing itself, which has an antagonistic effect to the race element. The key idea we derived on was to somehow integrate a race but in the most minimilastic terms so that the users focus is always set on the typing. How could we add a race without actually visually showing the race? After deliberating on this question for quite a while and trying out the typing tests several times, we cracked a solution.

The final concept that we decided on was to use the cursors as a way of racing across the text and updating the positions of all the racers in realtime across all the clients in a specific room. The position of all the players in the race is shown live through the position of their cursors on the screen in the least distracting way. This way we believe we were able to grasp the race element in a very minimilastic way. 

### Wireframing 

This was our [initial wireframe](). After some deliberations and changes, we ended up with this as our [final wireframe](). While building the application we did make some other changes while mostly following the initially laid out plan.

## Creative Design

While desiging the application, we made sure to spend time into deliberating and perfecting design decisions(even small ones) so as to enhance the user interface and user experience of the application. 

### User Interface and User Experience

The user interface is designed based on a minimilastic point of view to keep the typing environment distraction free. Intiially the after the user logs in, they are greeted with a waiting screen where they updated on the realtime status of the room. They can see players join and leave their room. When all four players join the room the waiting screen changes to the players ready screen and a race start button is displayed to the users. As soon as one of the players clicks the button, the race starts for all the users in the room. The navbar and the leaderboard page are all removed from the screen, keeping on the typing window open with text that the users are supposed to type.

As the user starts typing, the color of the text changes based on their input. If the character they entered is the correct character, then the cursor moves by one space and the color of the typed character changes to green denoting they pressed the right character. If they typed the wrong chracter, both the cursor and the character turns red denoting that the user typed the wrong character. The cursor won't move until the user types the correct character and as soon as the user does, the character and the cursor become green again. The players also see the cursors of the other players moving through the text. These cursors have been made distinct (and more dull) than the primary players cursor so as to minimize distractions. Just above the typing area, is a small container that displays the current position of the player in the race (similar to Asphalt, NFS, and other car racing games) so that the user gets an idea of their position in the race at a single glance. These small elements of UI, we believe, have a big impact on the overall experience of the user.

When a player finishes the race, they are greeted with a waiting screen so as to increase anticipation for the winners. When all connected players finish the race, the results are displayed with the usernames of the all the players where they get to see, for the very first time, who they were racing with. 

The entire user experience is based on keeping the users as much in the loop as possible of the presence and actions of other players in the game, while at the same time minimize the excessive elements and distractions. We have tried out best to share loads of information across users in realtime though small non-distracting elements. All these design decisions strengthen our argument of making a minimilastic application.

## Technical Design

The technical design and implementation of our application is done through a number of steps. In each step we integrated one more technology or feature into our application. This way we were able to test each feature independently of the others to handle more edge cases thereby making our code more robust. Given below is a generalized guide for the technologies we used and how they were used.

### Socket.io

Our application uses socket.io for the realtime sharing of information between the server and the clients. Using sockets also enabled us to create rooms and send different information to different clients in different rooms all at the same time which would have been extremely difficult had we used simple polling mechanisms. Having a race element required us to make all the information exchange as realtime as possible, and sockets had a huge role in helping us do so.

Using sockets we created rooms, having only a restricted number of clients join each to faciliatate races in groups. We relayed different typing tests to each, got back realtime positions of different players' cursors racing in a single room, and positions of the player in the race as a whole. The people connecting and disconnecting to the server was also managed by the sockets. Sending and receiving messages and information excahnge between different clients and clients and the server in realtime became possible by using sockets.

### NeDB Database

Our application requried the presence of a database to store user profile information as well as the total wins of every user. The latter data was very relevant while creating and updating the leaderboard. For the purpose of our application we choose to use the NeDB databse. It is a type of no-SQL database giving us more flexbility while data storing. We created two databases on NeDB, one to store the user authentication information (usernames and passwords - hashed), and another to store the highscores. Every time a race ends and the winner's score is updated in the highscore database, all the records, arranged in descending order, from the highscore database are sent to all the clients (connected across rooms) to update the leaderboard.

### User Authentication - Bcrypt

When a user first joins the server, they are asked to login. The username that the user enters is queried through the database to find existing entries of the same. If no records are found, then the process of registering a new user starts. First, the password they entered is hashed using bcrypt. The hashed password along with the username is then stored in the users database as a new record and a message is relayed to the client saying that their profile is created.

The next time the same user logs in and their username returns a record from the database, the password entered now is compared with the encypted password again through Bcrypt. If the password matches then a message of successful login is relayed to the user else they are asked to login again with the correct credentials or a new username. The code also looks for edge cases where the user chooses to cancel the prompt or submits it without any data. In such scenarios the application continues to prompt the user again and again until the user enters a valid input.

### Data 

Even though the application doesn't make any explicit calls, we use data from the 1000 most used english words. It is present in the form of a json file that is taken from [this](). The JSON file is imported to the server side and bunch of words randomly selected from the file are relayed to the clients as typing tests.

## Key Challenges and Solutions

### Sockets:

-- Having specific number of players in each room - Restricting the number of users to 4 in every room was a difficult task to begin with. New rooms had to be created everytime all the previous rooms were full and the client was made to join the newly created room. Only when a room had 4 people, the Race Start button was enabled and made visible to all the clients in the room.

-- Increasing reusability of existing rooms - We could just keep creating new rooms and putting in more people. But the problem here would be many of the rooms might start off as full but due to a client disconnection, there would be vacancies created in those rooms. In such scenarios, the remaining users won't be able to start the race as the room capacity of 4 won't be reached. Also when a race ends, new players must be able to join the room if the room has vacancies. To mitigate all these issues and put less load on the servers, we decided on reusing existing rooms whenever vacanies came up. Every time a user joined, all the rooms were checked through to see if there were any vacancies in them and new rooms were only created if all of the pre-existing rooms were full.

-- Keeping track of player's cursor precise positions at all times - The cursor data of each of the user had to be constantly sent to all the clients in every room so that they are able to see the cursors of all the players in real time. To keep track of this, everytime a user typed a correct character, the updated index position was immediately sent to the server which stored it to be relayed further.

-- Keeping track of player's positions (in the context of the entire race) at all times - The players had to be constantly updated about their position in the context of the race. To do this, we used the index values of their cursors and found their positions based on where their cursor indexes lied. This was then relayed to the users everytime they typed a new key.

-- Keeping track of disconnections - Dealing with client disconnections were a huge part of the successful implementation of the game. There were so many cases to look for when a client disconnects (discussed in detail in the here). During testing we faced several issues that arised from a client disconnecting that led to the game not starting or ending that were detrimental to the user experience.

-- Keeping track of race start and race finish - It was very important to always keep a track of all the races going on in different rooms as based on that the rooms that the new users will be put into was decided. Knowing when the race started was important as no other players could be allowed in even if there were vacancies that opened up due to client disconnections during the race. Knowing when the race finished was even more important as the winners had to be declared instantly and the rooms had to be opened up for other clients to join in if a existing client got disconnected.

### Database and Bcrypt:

-- Querying specific records and updating specific attributes - It required going through a lot of documentation to understand how to query in records from the database based on specific fields and data values. The more difficult task was updating as NeDB's update command came with a lot of additional attributes and wasn't really realtime which could mess up the leaderboard data.

-- Understanding and integrating Bcrypt with the database - Working with the database was made even more difficult with the integration of Bcrypt for user authentication. Most of the existing tutorials on the internet were based on async and await functions that we wanted to avoid for the purpose of the code. After spending quite a lot of time going through the documentation of both Bcrypt and NeDB, we were finally able to integrate them that allowed password encryption and increased security.

### Client Side:

-- Handling edge cases with user authentication - Users can be unpredictable and so we had to mitigate all possible ways a user's interaction could break our code to ensure the smooth running of our application. This involved validating inputs provided by the user so that the other pieces of our code which require valid user inputs don't throw in exceptions.

-- Implementing the typing part - We thought through quite a lot of ideas of implementing the typing part before arriving at the final implementation. The initial idea was to have the text in a div and an input text box above it using stacking (z-index). The users would type in the text box and would see the cursor move through the screen across the text in the div. But upon tryping to implement this, the code didn't provide us with the desired results. That is when we looked into this option of moving through the letters of the div itself. We accepted in the inputs from the user using the "Keypress" event listener.

-- Color coding different parts of the text - Color coding was only possible if we would be able to apply different styles inside the div. The way we chose to apply this was to have different span elements in our code each having assigned a separate class with different color styles. Based on the input of the user, we segregated the text present in the div into separate spans. This segregation was updated after every key stroke. This is how we were able to color code the different part of the typing test based on user input.

-- Fixing the spans in a specific place - Adding the spans introduced another problem. Somehow there was a inbuilt space that always arised between two span elements. This caused the entire text to shift after every keystroke making the user experience of typing very bad. After trying out several options with changing the display type, changing margins, padding, etc. we finally found a solution on the internet that required us to make the font size of the parent container set to 0. This way worked out.

-- Creating a moving cursor that smoothly goes through the text - Since the user wasn't really typing in a input box, we had no cursor that went through the text. The only way to implement this was to add a physical vertical bar (we decided on using "|") and moving it through the text inside the div after every keypress (based on the user input). To make the experience even better, we added additional blinking animation and styles to the cursor.

-- Displaying the realtime positions of all the cursors - This was perhaps the hardest parts of the entire project. To display the realtime position of the cursors of all the players in a room to all the players currently typing. It was extremely difficult cause the the position of each of the users were getting updated very rapidly and to be able to display the cursor at specific indexes in the the text div was even more difficult as we also had to determine which cursor was behind the primary cursor and which one was ahead. We had to make separate arrays which segregated the cursors before and after the primary cursor and sorted them. The biggest mistake we made that took hours to fix was not using the sort() function properly. We assumed that JS sort() works in a similar way as the sort functions of other coding languages work. Little did we know that JS sort() sorts everything as strings. This messed up the entire order of the text and position of cursors in the div repeatedly messing everything up. We tried out debugging the problem in every way possible, but all our attempts were in vain. It was only after we understood our mistake and fixed it, that the code gave us the desired results.

### Handling Misc Edge Cases

-- What if a client disconnects after joining a room?

-- What if a client disconnects from a room after the start button is already displayed?

-- What if a client disconnects mid race. How does the race end? 

-- What if a client disconnects as the last player in a race?

-- What happens when the client closes the prompt box for user authentication or doesn't enter anything at all?

## Bugs and issues

## Potential Next Steps

- Fixing all bugs and issues

- Giving the users the ability to create private rooms on their own to play with their fiends

- Increasing the types of typing tests available. 

- Providing both light and dark themes for the users to switch based on their requirement

- Increasing support and accessibility for visually impaired people - Touch typing is for everyone!

## Individual Contribution

### Swostik Pati

Swostik implemented majority of the sockets, databases, and user authentication part. He had an important role in implementing the typing and race element. He also contributed a lot to the front-end designing part. 

### Aibar Talip

## User Testing

We conducted user testing with several people. These are some of the images and video clips of them using the website with absolutely no involvement of the creators:


The feedback that we got from the user testers were as follows:
/photos

## References

[Node JS]()
[Express JS]()
[Socket.io]()
[NeDB] ()
[Bcrypt]()




