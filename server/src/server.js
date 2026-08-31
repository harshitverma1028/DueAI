import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';
import  app  from './app.js';
import { startReminderWorker } from './jobs/reminderWorker.js';

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('obligation:join', (id) => {
        socket.join(`obligation:${id}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        startReminderWorker();

        server.listen(PORT, () => {
            console.log(`DueAI API listening on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Server startup failed:', error);
        process.exit(1);
    });