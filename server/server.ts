import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import { createGameState, handleClick, handlePlayAgain, GameState } from "./tictactoe.js";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
await nextApp.prepare();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

type Room = {
    players: Record<string, string> // socketId -> symbol
    game: GameState
}

const rooms = new Map<string, Room>()

io.on("connection", (socket) => {
    console.log("New connection:", socket.id)
    let currentRoomId: string | null = null

    socket.on("createRoom", () => {
        const roomId = crypto.randomUUID()
        rooms.set(roomId, {
            players: {},
            game: createGameState()
        })
        socket.emit("roomCreated", { roomId: roomId })
        console.log("Room created:", roomId)
    })

    socket.on("joinRoom", (roomId: string) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit("roomNotFound");
            return;
        }

        const taken = new Set(Object.values(room.players));
        const symbol = !taken.has("X") ? "X" : !taken.has("O") ? "O" : null;
        if (!symbol) {
            socket.emit("gameFull");
            return;
        }

        currentRoomId = roomId;
        room.players[socket.id] = symbol;
        socket.join(roomId);

        socket.emit("init", { symbol, board: room.game.board, turn: room.game.turn, winner: room.game.winner });

        if (Object.keys(room.players).length === 2) {
            io.to(roomId).emit("gameReady");
        } else {
            socket.emit("waiting");
        }

        console.log(`Player ${socket.id} joined room ${roomId} as ${symbol}`);
    });

    socket.on("playerClick", (data: { index: number }) => {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;
        if (Object.keys(room.players).length < 2) return;

        const symbol = room.players[socket.id];
        if (symbol !== room.game.turn) return;

        room.game = handleClick(room.game, data.index);
        io.to(currentRoomId).emit("playerClick", {
            board: room.game.board,
            turn: room.game.turn,
            winner: room.game.winner
        });
    })

    socket.on("playAgain", () => {
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;
        if (Object.keys(room.players).length < 2) return;

        room.game = handlePlayAgain();
        
        for (const id in room.players) {
            room.players[id] = room.players[id] === "X" ? "O" : "X";
        }

        for (const id in room.players) {
            io.to(id).emit("playAgain", {
                symbol: room.players[id],
                board: room.game.board,
                turn: room.game.turn,
                winner: room.game.winner
            })
        }
    })

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
        if (!currentRoomId) return;
        const room = rooms.get(currentRoomId);
        if (!room) return;

        delete room.players[socket.id];
        io.to(currentRoomId).emit("enemyDc");

        if (Object.keys(room.players).length === 0) {
            rooms.delete(currentRoomId);
            console.log("Room deleted:", currentRoomId);
        }
    })
})

app.all("/socket.io/{*path}", (req, res, next) => {
    next()
})
app.all("/{*path}", (req, res) => handle(req, res))

httpServer.listen(4000, () => {
    console.log("Server running on http://localhost:4000")
})