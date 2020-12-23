import { useContext } from 'react';
import { Players } from './Players';
import { GameList } from './GameList';

export const Waiting = ({ players, games }) => {
    return (
        <main>
            <section className="flex flex-row m-2">
                <Players players={players} />
                <GameList games={games} />
            </section>
            <div className="bottom-0 my-2 m-auto text-center m-4 border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-blue-200 to-blue-100">
                抽選開始待ち...
            </div>
        </main>
    )
}
