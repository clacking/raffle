import React, { createContext, useEffect, useState } from 'react';
import { useToast } from "@chakra-ui/react"
import { useSocket } from '../socket';
import { Join } from './Join';
import { Waiting } from './Waiting';
import { Game } from './Game';
import { Admin } from './Admin';

export const Raffle = () => {
    const socket = useSocket();
    const toast = useToast();
    const [view, setView] = useState('name'); // 'name' | 'wait' | 'game'
    const [connected, setConnected] = useState(true);
    const [admin, setAdmin] = useState(false);
    const [games, setGames] = useState([]);
    const [players, setPlayer] = useState([]);

    useEffect(() => {
        socket.on('disconnect', e => setConnected(false));
        socket.once('admin', e => setAdmin(true));
        const showError = m => toast({ title: 'Error', description: m, status: 'error', duration: 3000, position: 'bottom-left' })
        socket.on('error', showError);

        const join = e => {
            setView('wait');
            setPlayer(e.players);
            setGames(e.games || []);
        }
        socket.on('join', join);

        const startGame = e => setView('game');
        socket.on('startGame', startGame);

        const playerChange = u => setPlayer(u);
        socket.on('playerJoin', playerChange);
        socket.on('playerDisconnect', playerChange);

        const addGames = g => setGames(g);
        socket.on('addGroup', addGames);
        socket.on('addItem', addGames);

        const goNext = next => {
            if (view === 'name') return;
            setPlayer(next.players);
            setGames(next.games);
            setView('wait');
        } 
        socket.on('next', goNext);

        return () => {
            socket.off('error', showError);
            socket.off('join', join);
            socket.off('startGame', startGame);
            socket.off('playerJoin', playerChange);
            socket.off('playerDisconnect', playerChange);
            socket.off('addGroup', addGames);
            socket.off('addItem', addGames);
            socket.off('next', goNext);
        }
    } , [view]);

    return (
        <main className="m-auto relative">
            <div className="fixed top-0 left-0 m-2 select-none">
                {connected ? <span className="text-green-800">✓</span> : <span className="text-red-800">✘ Disconnected</span>}
            </div>
            {
                view === 'name' ? <Join /> :
                view === 'wait' ? <Waiting players={players} games={games} /> :
                view === 'game' ? <Game players={players} games={games} /> : <></>
            }
            { admin ?
                <div className="fixed bottom-0 right-0 mx-12">
                    <Admin games={games} players={players} />
                </div>
                : <></>
            }
        </main>
    );
}
