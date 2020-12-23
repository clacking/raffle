import { useEffect, useState } from 'react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, useDisclosure, Button,
    useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Tooltip
} from "@chakra-ui/react"
import { motion } from "framer-motion";
import RandomString from 'crypto-random-string';
import { useSocket } from '../socket';
import { Players } from './Players';
import { GameList } from './GameList';
import { Wheel } from './Wheel';

export const Game = ({ players, games }) => {
    const toast = useToast();
    const socket = useSocket();
    const [view, setView] = useState('select'); // 'select' | 'roll'
    const [roller, setRoller] = useState(false);
    const [rollerSelect, setRollerSelect] = useState(false);
    const [click, setClick] = useState(false);
    const [group, setGroup] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [winner, setWinner] = useState({});
    // RNG
    const [serverHash, setServerHash] = useState('');
    const [serverRandom, setServerRandom] = useState('');
    const [clientRandom, setClientRandom] = useState('');

    useEffect(() => {
        const yourTurn =  e => {
            setRoller(true);
            setRollerSelect(true);
            setClientRandom(RandomString({length: 12, type: 'alphanumeric'}));
            toast({
                title: 'あなたのターンです',
                duration: 3000,
                position: 'top'
            }); 
        }
        socket.on('yourTurn', yourTurn);
        const selectGroup = g => {
            setGroup(g.groupID);
            setServerHash(g.serverRandom);
            setView('roll');
        }
        socket.on('selectGroup', selectGroup);
        const showResult = n => {
            setServerRandom(n.serverRandom);
            setRollerSelect(false);
            setWinner(n);
            onOpen();
        }
        socket.on('showResult', showResult);
        const setRoll = rand => setClientRandom(rand);
        socket.on('roll', setRoll);

        return () => {
            socket.off('yourTurn', yourTurn);
            socket.off('selectGroup', selectGroup);
            socket.off('showResult', showResult);
            socket.off('showResult', showResult);
            socket.off('roll', setRoll);
        }
    }, []);

    const selectGroup = (e) => {
        const value = parseInt(e.target.value);
        socket.emit('selectGroup', value);
    }

    const startRoll = (e) => {
        setClick(!click);
        socket.emit('roll', clientRandom);
    }

    return (
        <div>
            { view === 'select' ?
                <main>
                    <section className="flex flex-row m-2">
                        <Players players={players} />
                        <GameList games={games} />
                    </section>
                    { rollerSelect ?
                        <div className="bottom-0 my-2 m-auto text-center m-4 border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-blue-200 to-blue-100">
                            箱を選んでね
                            <p>
                                { games.map( (v,k) => <button className="m-2 p-4 bg-blue-300 rounded my-2" key={k} value={v[0]} onClick={selectGroup}>Group {v[0]}</button>) }
                            </p>
                        </div>
                        :
                        <div className="bottom-0 my-2 m-auto text-center m-4 border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-blue-200 to-blue-100">
                            選択待ち...
                        </div>
                    }
                </main>
                :
                <main className="border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-indigo-800 to-indigo-700 text-white select-none">
                    <h1 className="text-center m-2 text-xl">☆★☆ UNBOXING ☆★☆</h1>
                    <Wheel slot={games.filter(e => e[0]===group).flat()[1]} />
                    <div className="mx-auto my-2 text-center justify-center flex flex-row text-xs">
                        <p>
                            <p>Server seed Hash</p>
                            <input type="text" className="m-2 p-1 text-black rounded" value={serverHash} disabled={true} />
                        </p>
                        <p>
                            <p>Player seed</p>
                            <input type="text" className="m-2 p-1 text-black rounded " value={clientRandom} onChange={e => setClientRandom(e.target.value)} disabled={!roller} />
                        </p>
                    </div>
                    { roller ?
                        <div className="m-8 text-center">
                            <motion.button
                                initial={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    duration: 1.2
                                }}
                                animate={click ? 'click' : 'none'}
                                variants={{
                                    click: { rotate: 360, scale: [1, 1.3, 1] },
                                    none: {}
                                }}
                                onClick={startRoll}
                                className="p-4 mx-auto outline-none bg-yellow-400 rounded-full h-24 w-24 text-red-600 items-center justify-center font-black text-xl disabled:cursor-not-allowed shadow"
                                disabled={click}
                            >
                                OPEN
                            </motion.button>
                        </div>
                    : <></>}
                        <Modal onClose={onClose} isOpen={isOpen} isCentered>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader className="text-center">🔥🔥🔥 RESULT 🔥🔥🔥</ModalHeader>
                                <ModalBody>
                                    <div>
                                        <img className="shadow mx-auto" src={winner.img} />
                                        <p className="text-3xl text-center">{winner.name} by {winner.by}</p>
                                    </div>
                                    <div className="text-xs mt-4">
                                        <Tooltip label="hex2dec(SHA256(serverSeed+clientSeed))" placement="top" aria-label="Fair">
                                            <p className="text-center">Verify seed ✅</p>
                                        </Tooltip>
                                        <Accordion>
                                            <AccordionItem>
                                                <AccordionButton>
                                                    <Box flex="1" textAlign="left">
                                                        Provably fair info
                                                    </Box>
                                                  <AccordionIcon />
                                                </AccordionButton>
                                                <AccordionPanel pb={4}>
                                                    <p>Server hash: {winner.serverHash}</p>
                                                    <p>Server seed: {winner.serverRandom}</p>
                                                    <p>Client seed: {winner.clientRandom}</p>
                                                    <p>Result: {winner.resultNumber}</p>
                                                    <p>Pattern: {JSON.stringify(winner.pattern)}</p>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={onClose}>Close</Button>
                                </ModalFooter>
                                </ModalContent>
                        </Modal>
                </main>
            }
        </div>
    )
}

