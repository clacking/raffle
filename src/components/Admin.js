import { useContext, useState } from 'react';
import { useSocket } from '../socket';

export const Admin = ({ games, players }) => {
    const socket = useSocket();
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [by, setBy] = useState('');
    const [img, setImg] = useState('');
    const [color, setColor] = useState('#000000');

    const [roller, setRoller] = useState('');

    const addGroup = () => socket.emit('addGroup');

    const addItem = () => {
        socket.emit('addItem', {
            id: parseInt(id), img, name, by, color
        });
        setName('');
        setBy('');
        setImg('');
    }

    const start = () => socket.emit('startGame');

    const deleteGroup = () => socket.emit('deleteGroup', parseInt(id));

    const choseRoller = () => {
        socket.emit('setRoller', roller);
    }

    const next = () => socket.emit('next');

    return (
        <div className="border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-1 bg-gradient-to-r from-green-200 to-green-100">
            <div>
                <select onChange={e=>setId(e.target.value)}>
                    <option></option>
                    {
                        games.map( (v,k) => <option key={k} value={v[0]}>{v[0]}</option>)
                    }
                </select>
                <input type="text" className="m-2" placeholder="名前" value={name} onChange={e=>setName(e.target.value)} />
                <input type="text" className="m-2" placeholder="さん" value={by} onChange={e=>setBy(e.target.value)} />
                <input type="text" className="m-2" placeholder="画像" value={img} onChange={e=>setImg(e.target.value)} />
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} />
                <button className="text-white bg-blue-600 m-1" onClick={addItem}>Add item</button>
                <button className="text-white bg-blue-600 m-1" onClick={addGroup}>Add group</button>
                <button className="text-white bg-red-600 m-1" onClick={deleteGroup}>Remove group</button>
            </div>
            <div>
                <select onChange={e=>setRoller(e.target.value)}>
                    <option></option>
                    {
                        players.map( (v,k) => <option key={k} value={v.id}>{v.name}</option>)
                    }
                </select>
                <button className="text-white bg-blue-600 m-1" onClick={start}>Start</button>
                <button className="text-white bg-blue-600 m-1" onClick={choseRoller}>Set Roller</button>
                <button className="text-white bg-green-400 m-1" onClick={next}>NEXT</button>
            </div>
        </div>
    )
}
