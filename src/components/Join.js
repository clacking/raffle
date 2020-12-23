import { useContext, useState } from 'react';
import { useSocket } from '../socket';

export const Join = () => {
    const socket = useSocket();
    const [name, setName] = useState('');

    const submit = () => {
        socket.emit('join', name);
    }

    return (
        <div className="text-center border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-blue-200 to-blue-100">
            <p>名前を入れてね</p>
            <input className="border" type="text" value={name} onChange={e => setName(e.target.value)} />
            <p><button className="p-2 m-2 bg-blue-400 rounded text-white" onClick={submit}>JOIN</button></p>
        </div>
    )
}
