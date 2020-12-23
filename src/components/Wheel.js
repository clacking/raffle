import { useEffect, useRef, useState } from 'react';
import NoIMG from '../assets/noimg.png';
import { useSocket } from '../socket';

const CardSize = 150;
const Colors = ['border-yellow-300', 'border-green-300', 'border-red-600', 'border-blue-300', 'border-indigo-700', 'border-purple-700', 'border-pink-600'];

export const Wheel = ({slot}) => {
    const wheelRef = useRef(null);
    const socket = useSocket();
    const [winner, setWinner] = useState(0);

    useEffect(() => {
        const result =  win => {
            setWinner(win.result);
            const spinWheel = () => {
                const position = win.result;
            
                let landingPosition = (position * CardSize) + (CardSize * slot.length * 13) - 150;
            
                const randomize = Math.floor(Math.random() * 75) - 75/2;
                landingPosition += randomize;
            
                wheelRef.current.style.transitionTimingFunction = `all 6000ms cubic-bezie`;
                wheelRef.current.style.transitionDuration = `6s`;
                wheelRef.current.style.transform = `translate3d(-${landingPosition}px, 0px, 0px)`
                setTimeout(() => {
                    const resetTo = -(position * CardSize + randomize + slot.length * CardSize - 150);
                    wheelRef.current.style.transitionTimingFunction = '';
                    wheelRef.current.style.transitionDuration = '';
                    wheelRef.current.style.transform = `translate3d(${resetTo}px, 0px, 0px)`
                }, 6000);
            };
            setTimeout(() => {
                spinWheel();
            }, 1000);
        }
        socket.on('result', result);

        return () => {
            socket.off('result', result);
        }
    },[winner]);

    return (
        <div className="game bg-blue-400 shadow-lg">
            <div className="container shadow-lg" ref={wheelRef}>
                {
                    [...Array(15)].map((_, k) => slot.map((g, k2) =>
                        <div className={`box flex flex-col truncate opacity-80 bg-gray-800 text-white border-l-4 ${Colors[k2]}`} key={(k*slot.length)+k2}>
                            <img className="h-20 m-auto" src={g.img || NoIMG} />
                            <div className="pl-2 bg-gray-700 shadow">
                                <p>{g.name}</p>
                                <p>{g.by}</p>
                            </div>
                        </div>
                    )).flat()
                }
            </div>
            <div className="bar"></div>
        </div>
    )
}
