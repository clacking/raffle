import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import './App.css';
import { Raffle } from './components/Raffle';

function App() {
    window.addEventListener('beforeunload', (e) => {
        e.returnValue = '更新しますか';
    }, false);

    return (
        <div className="flex relative w-screen h-screen bg-cover bg-fixed bg-center bg-clip-padding bg-repeat-space" id="App">
            <ChakraProvider>
                <Raffle />
            </ChakraProvider>
        </div>
    );
}

export default App;
