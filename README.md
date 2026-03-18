# Multiplayer Tic-Tac-Toe
A real-time multiplayer Tic-Tac-Toe game using WebSockets.
Available at: https://tictactoe.shotcrib.com
-------------------------------------------------------------
## Screenshots
| Home | Share | Playing | END |
|------|-------|---------| --- |
| ![Start](./docs/start-page.png) | ![Share](./docs/share-link.png) | ![Results](./docs/playing.png) | ![End](./docs/end.png) |

## Overview
Two players connect to the same game room by sharing a link to it. Then you take turns placing marks. The server manages game state and syncs moves instantly between clients using WebSockets.

## Tech Stack
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socketdotio&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)

## Setup
### Prerequisites
- Docker
  
### Installation
```bash
git clone https://github.com/ShotCrib77/websockets-tic-tac-toe
cd websockets-tic-tac-toe
docker build -t tic-tac-toe .
docker run -d -p 4000:4000 --name tic-tac-toe tic-tac-toe
```

## Notes
Relativly easy project. Fun to learn how persistent connections / websockets work. The biggest challange was to get an inital grasp of how socket.io works as well as remebering to allways have the server side as the "source of truth" for the game logic.

## License
[MIT](./LICENSE)
