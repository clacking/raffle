const { createHash } = require('crypto');
const socketio = require('socket.io');
const cryptoRandomString = require('crypto-random-string');

const Log = s => console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]`, s);

const createResult = (server, client, length) => {
    const combine = server + client;
    const hash = createHash('sha256').update(combine).digest('hex');
    const result = Math.floor( parseInt(hash, 16) % 10000 / (10000/length) );
    return result; 
}

exports.handler = http => {
    const io = socketio(http);

    const key = cryptoRandomString({ length: 12, type: 'alphanumeric' });
    Log(`Admin key: /?key=${key}`);

    let players = [];
    const games = new Map();
    let roller = '';
    let selectedGroup = null;
    const socks = new Map();
    let serverRandom = null;

    io.on('connection', sock => {
        const { id } = sock;
        let isAdmin = false;
        socks.set(id, sock);
        Log(`New socket: ${id}`);

        if (sock.handshake.query.key === key ) {
            isAdmin = true;
            sock.emit('admin', true);
            sock.on('addItem', e => {
                const group = games.get(e.id);
                if (!group) {
                    sock.emit('error', 'no group.');
                    return;
                }
                group.push({ img: e.img, name: e.name, by: e.by });
                io.sockets.emit('addItem', Array.from(games));
            });
            sock.on('addGroup', e => {
                const gid = games.size + 1;
                games.set(gid, []);
                Log(`Added group: ${gid}`);
                io.sockets.emit('addGroup', Array.from(games.entries()));
            });
            sock.on('setRoller', uid => {
                const u = socks.get(uid);
                if (!u) {
                    sock.emit('error', 'no user.');
                    return;
                }
                roller = uid;
                Log(`Set roller: ${JSON.stringify(uid)}`);
                u.emit('yourTurn');
                io.sockets.emit('newRoller', uid);
            });
            sock.on('startGame', e => {
                Log(`Game start`);
                io.sockets.emit('startGame');
            }); 
            sock.on('next', () => {
                Log(`Next round`);
                io.sockets.emit('next', { players, games: Array.from(games) });
            });
            sock.on('deleteGroup', id => {
                games.delete(id);
                io.sockets.emit('addGroup', Array.from(games.entries()));
            });
        }

        sock.on('disconnect', e => {
            players = players.filter(p => p.id!==id)
            Log(`Socket disconnect: ${id}`);
            io.sockets.emit('playerDisconnect', players);
        });

        // User events
        sock.on('join', name => {
            const player = { name, id, rolled: false };
            players = [...players, player]
            Log(`New player: ${name}`);
            sock.emit('join', { players, games: Array.from(games) });
            io.sockets.emit('playerJoin', players);

            sock.on('selectGroup', gid => {
                const g = games.get(gid);
                if (g.length < 1) {
                    sock.emit('error', 'もうないよ');
                    return;
                }
                Log(`Box selected: ${gid}, ${JSON.stringify(g)}`);
                selectedGroup = gid;
                serverRandom = cryptoRandomString({ length: 64, type: 'alphanumeric' });
                const hash = createHash('sha256').update(serverRandom).digest('hex');
                io.sockets.emit('selectGroup', { groupID: selectedGroup, serverRandom: hash });
            });
            sock.on('roll', clientRandom => {
                Log(`Roll: ${clientRandom}`);
                if (roller === id) {
                    const g = games.get(selectedGroup);
                    const rng = createResult( serverRandom, clientRandom,g.length );
                    Log(`Roll result: ${rng}`);
                    io.sockets.emit('roll', clientRandom);
                    io.sockets.emit('result', {result: rng, clientRandom});
                    setTimeout(() => {
                        Log(`Result sent: ${JSON.stringify({ ...g[rng], serverRandom })}`);
                        io.sockets.emit('showResult', {
                            ...g[rng], serverRandom, clientRandom, serverHash: createHash('sha256').update(serverRandom).digest('hex'),
                            resultNumber: rng, pattern: g
                        });
                        const next = g.filter((_, k) => k !== rng);
                        games.set(selectedGroup, next);
                        roller = null;
                    }, 7500);
                } else {
                    sock.emit('error', 'Not your turn.');
                }
            });

        });
    });
}

