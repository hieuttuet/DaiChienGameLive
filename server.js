/**
 * SHARED MULTI-PROJECT SERVER (Express + Socket.IO + SharedTikTokService)
 * - Dùng chung 1 kết nối TikTok Live (`core/tiktok-service.js`) cho các dự án game con.
 * - Dự án hiện tại: /games/toaan/ (Tòa Án Hóng Biến Neon - Matter.js)
 */

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const SharedTikTokService = require("./core/tiktok-service");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 2222;

// 1. Khởi tạo dịch vụ kết nối TikTok Live dùng chung
const tiktokService = new SharedTikTokService(io);

// 2. Giao tiếp Socket.IO điều khiển kết nối TikTok Live dùng chung
io.on("connection", (socket) => {
  console.log(`🔌 [Socket.IO] Trình duyệt đã kết nối: ${socket.id}`);

  socket.emit("tiktok_status", {
    ...tiktokService.getStatus(),
    message: tiktokService.getStatus().connected
      ? `Đang kết nối Live: @${tiktokService.getStatus().username}`
      : "Chưa kết nối kênh TikTok Live"
  });

  socket.on("connect_tiktok", async (data) => {
    try {
      await tiktokService.connect(data?.username);
    } catch (err) {
      socket.emit("tiktok_status", {
        connected: false,
        connecting: false,
        username: data?.username || "",
        error: err.message,
        message: err.message
      });
    }
  });

  socket.on("disconnect_tiktok", () => {
    tiktokService.disconnect();
  });
});

// 3. Khởi động Server
server.listen(PORT, () => {
  console.log("================================================================");
  console.log(`🚀 Multi-Game TikTok Live Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`   👉 Trang Portal:               http://localhost:${PORT}/`);
  console.log(`   👉 Tòa Án Hóng Biến Neon:      http://localhost:${PORT}/games/toaan/`);
  console.log("================================================================");

  const cliUsername = process.argv[2] || process.env.TIKTOK_USERNAME;
  if (cliUsername) {
    tiktokService.connect(cliUsername).catch((err) => {
      console.error("Không thể tự động kết nối:", err.message);
    });
  }
});
