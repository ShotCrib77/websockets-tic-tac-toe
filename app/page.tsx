
"use client";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Socket } from "socket.io-client";
import Board from "./components/Board";

const WINNING_SEQUENCE = [
    { index: 0, player: "X" },
    { index: 4, player: "O" },
    { index: 8, player: "X" },
    { index: 2, player: "O" },
    { index: 6, player: "X" },
    { index: 3, player: "O" },
    { index: 7, player: "X" },
];

export default function Home() {
    // Animation
    const [animatedBoard, setAnimatedBoard] = useState(Array(9).fill(""));
    const moveIndexRef = useRef(0);
    const [showLine, setShowLine] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const [gameLink, setGameLink] = useState("");
    const [copied, setCopied] = useState(false);

    // Animation for the tic tac toe board.
    useEffect(() => {
        const interval = setInterval(() => {
            if (moveIndexRef.current >= WINNING_SEQUENCE.length) {
                setShowLine(true);
                return;
            }

            const { index, player } = WINNING_SEQUENCE[moveIndexRef.current];
            setAnimatedBoard(prev => {
                const next = [...prev];
                next[index] = player;
                return next;
            });
            moveIndexRef.current += 1;
        }, 300);

        return () => clearInterval(interval);
    }, []);

    // Socket event listenrs
    useEffect(() => {
        const socket = io({
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on("roomCreated", (data: { roomId: string }) => {
            console.log("ROOM ID: ", data.roomId);
            setGameLink(`${window.location.origin}/game/${data.roomId}`);
        });

        return () => {
            socket.off("roomCreated");
            socket.disconnect();
        };
        
    }, []);
    
    const handleStartGame = () => {
        console.log("start?")
        socketRef.current?.emit("createRoom");
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(gameLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Animation
    const getCellCenter = (index: number) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        return {
            x: (col * 33.33) + 16.67,
            y: (row * 33.33) + 16,
        }
    }

    return (
        <main className="relative flex flex-col gap-4 justify-center items-center min-h-screen">
            <div className="flex flex-col justify-center items-center gap-2">
                <h1 className="text-amber-600 text-5xl" style={{
                    textShadow: `
                        -1px -1px 0 rgba(255,255,255,0.3),
                        1px 1px 0 #78350f,
                        2px 2px 0 #78350f,
                        3px 3px 0 #451a03,
                        4px 4px 8px rgba(0,0,0,0.5)
                    `
                }}>
                    TIC TAC TOE
                </h1>
                <div className="relative">
                    <Board handleClick={() => {}} board={animatedBoard} />
                    
                    {showLine && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line
                                x1={`${getCellCenter(6).x}%`}
                                y1={`${getCellCenter(6).y}%`}
                                x2={`${getCellCenter(8).x}%`}
                                y2={`${getCellCenter(8).y}%`}
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: 300,
                                    strokeDashoffset: 300,
                                    animation: 'draw-line 0.8s ease-in-out forwards'
                                }}
                            />
                        </svg>
                    )}
                </div>
            </div>

            <button 
                onClick={handleStartGame} 
                className="bg-[#d27f1b] p-2 rounded-md text-white hover:bg-amber-700"
            >
                Start Game
            </button>

            {/* Gamelink Popup */}
            {gameLink && (
                <div>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => setGameLink("")}
                    />

                    {/* Modal */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 flex flex-col gap-4 w-80 z-10">
                        <h2 className="text-lg font-semibold text-amber-700 text-center">Share this link</h2>
                        <p className="text-sm text-gray-500">Send this link to your friend to start the game.</p>

                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2">
                            <span className="text-sm text-gray-700 truncate flex-1">{gameLink}</span>
                            <button onClick={handleCopy} className="...">
                                {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4 text-amber-800" />}
                            </button>
                        </div>

                        <Link
                            href={gameLink}
                            className="flex items-center justify-center gap-2 bg-[#d27f1b] text-white rounded-lg py-2 hover:bg-amber-700 transition-colors"
                        >
                            →
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}