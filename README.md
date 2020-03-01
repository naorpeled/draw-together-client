 # ✏️ What is Draw Together?
Draw Together is a real-time whiteboard for collaborating and drawing with others.

## 🎧 Technologies
#### frontend
- React (w/ ContextAPI)
- Socket.io client

#### backend
- Nodejs
- Express
- Socket.io

## 🤔 Conclusions from this project
- Don't rescale a canvas when using sockets, because people usually have screens with different sizes.
- When adding a margin to a canvas, you have to calculate the distance between the dot that you're trying to draw and the window's border because canvas' coordinates are not related to the window's coordinates.

## 🏃 How to run?
### Prerequisites
- Node.js ([Download](https://nodejs.org/en/))

### Steps
1) Download the content of this repository.
2) Open your terminal (linux/MacOS) or Git Bash.
3) Move into the directory using the ```cd```([?](https://en.wikipedia.org/wiki/Cd_(command) "More info about cd")) command.
4) Run ```npm install``` in order to install all the dependancies.
5) Run ```npm run start```.
6) Open your browser and go to ```localhost:3000```.

## 🏹 Links
-  [Server](https://github.com/naorpeled/draw-together-server/ "Draw Together's server")
-  [Client](https://github.com/naorpeled/draw-together-client/ "Draw Together's client")
