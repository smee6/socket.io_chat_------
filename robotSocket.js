//express module type
import express from 'express';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    io.emit('message', 'Hello everyone');
});


io.on('connection', (socket) => {
    console.log('a user connected');
    let nickname = 'Anonymous'; // 기본 닉네임 설정
    let userCount = io.engine.clientsCount; // 현재 접속자 수

    let seed = Math.floor(Math.random() * 16777215).toString(16); // 랜덤 시드 생성

    // 새로운 사용자가 접속했을 때 접속자 수를 전송
    io.emit('message', `접속 : ${userCount} 명`);


    // 닉네임 설정 요청 처리
    socket.on('setNickname', (name) => {
        nickname = name;
        console.log(`User nickname is set to ${nickname}`);
        io.emit('message', `${nickname} joined the chat`);
    });

    // 채팅 메시지 요청 처리
    socket.on('chatMessage', (msg) => {
        // 닉네임과 메시지를 함께 전송
        io.emit('message', `${nickname}: ${msg} (${seed})`);

    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        userCount = io.engine.clientsCount;
        io.emit('message', `${nickname} left the chat`);
    });
});

server.listen(4000, () => {
    console.log('listening for requests on port 4000');
});
