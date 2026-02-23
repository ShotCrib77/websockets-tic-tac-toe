"use client";
import { io } from "socket.io-client";
import Board from "@/app/components/Board";
import { useEffect, useState } from "react";
import PlayAgain from "@/app/components/PlayAgain";
import { useRef } from "react";
import { Socket } from "socket.io-client";
import LoadingDots from "@/app/components/LoadingDots";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
    const roomId = useParams().roomId as string;
    const router = useRouter();

    const [disconnect, setDisconnect] = useState(false);
    const [waiting, setWaiting] = useState(true);
    const [symbol, setSymbol] = useState("");
    const [turn, setTurn] = useState("X");
    const [winner, setWinner] = useState("");
    const [board, setBoard] = useState(["", "", "",
                                        "", "", "", 
                                        "", "", ""]);

    const socketRef = useRef<Socket | null>(null);

    // Socket init listeners 
    useEffect(() => {
        const socket = io({
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("connected", socket.id);
            socket.emit("joinRoom", roomId)
        });

        socket.on("roomNotFound", () => {
            router.push("/")
        })
        socket.on("gameFull", () => {
            router.push("/")
        })

        socket.on("init", (data) => {
            setSymbol(data.symbol);
            setBoard(data.board);
            setTurn(data.turn);
            setWinner(data.winner);
        });

        socket.on("playerClick", (data) => {
            setWinner(data.winner);
            setBoard(data.board);
            setTurn(data.turn);
        });

        socket.on("playAgain", (data) => {
            setSymbol(data.symbol);
            setBoard(data.board);
            setTurn(data.turn);
            setWinner(data.winner);
        });

        socket.on("waiting", () => {
            setWaiting(true);
        });

        socket.on("gameReady", () => {
            setWaiting(false);
        });

        socket.on("enemyDc", () => {
            setDisconnect(true);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId, router]);

    const handlePlayAgainClick = () => {
        setDisconnect(false);
        socketRef.current?.emit("playAgain");
    }
    
    const handleClick = (index: number) => {
        console.log(index, turn, symbol);

        if (board[index]) { return };
        
        if (turn === symbol) {
            console.log("angry bird");
            socketRef.current?.emit("playerClick", { index: index });
        }
    }

    return (
        <main className="relative flex flex-col gap-4 justify-center items-center min-h-screen">

            {(waiting && !disconnect) ? ( 
                <div className="text-3xl flex ">
                    <span className="mr-2">Waiting for player 2</span> <LoadingDots /> 
                </div> 
            ) :
            (
                <div className="flex flex-col justify-center items-center gap-2">
                    <span className="mr-2 text-3xl">{`Player ${turn}'s turn`}</span>
                    <span className="mr-2 text-2xl">{`You're ${symbol}'s`}</span>
                </div> 
            )}
            
            <div className="flex flex-col gap-4">
                <Board handleClick={(index) => handleClick(index)} board={board}/>

                <Link
                    href={"/"}
                    className="flex items-center justify-center gap-2 bg-[#d27f1b] text-white rounded-lg py-2 hover:bg-amber-700 transition-colors"
                >
                    ←
                </Link>
            </div>

            {(winner || disconnect) &&
                <div className="fixed top-0 left-0 w-full h-full bg-[#000000b6] flex flex-col justify-center items-center gap-4">
                    <span className="text-5xl text-white z-40">{disconnect ? `${symbol === "X" ? "O" : "X"} dissconected ${symbol} won!` : winner === "draw" ? "Draw" :  `${winner} won!` }</span>
                    { !disconnect ? <PlayAgain handlePlayAgain={handlePlayAgainClick} /> : <Link href="/">Home</Link> }
                </div>
            }
        </main>
    );
}
