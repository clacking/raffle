import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';

let socket = null;
export const useSocket = () => socket ? socket : socket = io(document.location.search);
