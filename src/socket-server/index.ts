import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const app = express();
const httpServer = createServer(app);

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    const io = new Server(httpServer, {
        adapter: createAdapter(pubClient, subClient),
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Webhook for non-Redis triggers (optional backup)
    app.use(express.json());
    app.post("/trigger", (req, res) => {
        const { event, data, room } = req.body;
        if (room) {
            io.to(room).emit(event, data);
        } else {
            io.emit(event, data);
        }
        res.json({ success: true });
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join_room", (room: string) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room ${room}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`Socket server running on port ${PORT} with Redis Adapter`);
    });
});
