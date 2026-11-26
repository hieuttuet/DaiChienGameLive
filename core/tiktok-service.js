/**
 * SHARED TIKTOK LIVE SERVICE (v2.5.0 / Proto v3)
 * Dùng chung cho mọi dự án con trong hệ thống.
 * Chuẩn hóa toàn bộ sự kiện TikTok Live (chat, like, gift, member, share)
 * và phát qua Socket.IO + callback nội bộ.
 */

const { TikTokLiveConnection, WebcastEvent, ControlEvent } = require("tiktok-live-connector");

class SharedTikTokService {
  constructor(io) {
    this.io = io;
    this.connection = null;
    this.processedGiftMsgIds = new Set();
    this.listeners = new Map(); // eventName -> Set<fn>
    this.state = {
      connected: false,
      connecting: false,
      username: "",
      roomId: null,
      error: null
    };
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);
  }

  _emitLocal(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[SharedTikTokService] Lỗi handler ${eventName}:`, err.message);
      }
    }
  }

  _broadcastStatus(extra = {}) {
    const statusPayload = { ...this.state, ...extra };
    this.io.emit("tiktok_status", statusPayload);
  }

  static extractUserInfo(data, fallbackName = "Người Xem") {
    const user = data?.user || data || {};
    const uniqueId = user.displayId || user.uniqueId || user.id || data?.uniqueId || "unknown_user";
    const nickname = user.nickname || data?.nickname || uniqueId || fallbackName;
    const profilePictureUrl =
      user.avatarThumb?.urlList?.[0] ||
      user.profilePicture?.url?.[0] ||
      user.profilePictureUrl ||
      data?.profilePictureUrl ||
      "";
    return { uniqueId: String(uniqueId), nickname: String(nickname), profilePictureUrl };
  }

  getStatus() {
    return { ...this.state };
  }

  disconnect() {
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (_) {}
      this.connection = null;
    }
    this.state = {
      connected: false,
      connecting: false,
      username: "",
      roomId: null,
      error: null
    };
    this._broadcastStatus({ message: "Đã ngắt kết nối TikTok Live" });
  }

  async connect(rawUsername) {
    const cleanUsername = String(rawUsername || "")
      .trim()
      .replace(/^@/, "");

    if (!cleanUsername) {
      throw new Error("Vui lòng nhập TikTok Username hợp lệ!");
    }

    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (_) {}
      this.connection = null;
    }

    console.log(`⏳ [TikTok Live] Đang kết nối tới kênh @${cleanUsername}...`);
    this.state = {
      connected: false,
      connecting: true,
      username: cleanUsername,
      roomId: null,
      error: null
    };
    this._broadcastStatus({ message: `Đang kết nối tới @${cleanUsername}...` });

    const conn = new TikTokLiveConnection(cleanUsername, {
      processInitialData: false,
      enableExtendedGiftInfo: false
    });
    this.connection = conn;

    try {
      const state = await conn.connect();
      this.state = {
        connected: true,
        connecting: false,
        username: cleanUsername,
        roomId: state.roomId,
        error: null
      };
      console.log(`✅ [TikTok Live] Đã kết nối thành công tới @${cleanUsername} (Room ID: ${state.roomId})`);
      this._broadcastStatus({ message: `Đã kết nối Live: @${cleanUsername}` });
    } catch (err) {
      this.state = {
        connected: false,
        connecting: false,
        username: cleanUsername,
        roomId: null,
        error: err.message || "Không thể kết nối TikTok Live"
      };
      console.error(`❌ [TikTok Live] Lỗi kết nối @${cleanUsername}:`, err.message);
      this._broadcastStatus({ message: `Lỗi kết nối @${cleanUsername}: ${err.message}` });
      return;
    }

    // 1. CHAT
    conn.on(WebcastEvent.CHAT, (data) => {
      const user = SharedTikTokService.extractUserInfo(data, "Chiến Binh");
      const comment = String(data.content || data.comment || "").trim();
      if (!comment) return;

      const payload = { ...user, comment };
      this.io.emit("tiktok_chat", payload);
      this._emitLocal("chat", payload);
    });

    // 2. LIKE
    conn.on(WebcastEvent.LIKE, (data) => {
      const user = SharedTikTokService.extractUserInfo(data, "Người Xem");
      const likeCount = Number(data.count || data.likeCount) || 1;
      const payload = { ...user, likeCount };
      this.io.emit("tiktok_like", payload);
      this._emitLocal("like", payload);
    });

    // 3. GIFT (Proto v3 + Chống lặp combo)
    conn.on(WebcastEvent.GIFT, (data) => {
      const user = SharedTikTokService.extractUserInfo(data, "Đại Gia");
      const giftType = data.gift?.type ?? data.giftDetails?.giftType ?? data.giftType;
      const giftName = data.gift?.name ?? data.giftDetails?.giftName ?? data.extendedGiftInfo?.name ?? data.giftName ?? "Quà Tặng";
      const diamondCount = Number(data.gift?.diamondCount ?? data.giftDetails?.diamondCount ?? data.extendedGiftInfo?.diamond_count ?? data.diamondCount) || 1;
      const repeatCount = Number(data.repeatCount) || 1;

      if (giftType === 1 && !data.repeatEnd) {
        return;
      }

      const msgId = String(data.common?.msgId || `${user.uniqueId}_${data.giftId}_${data.groupId || Date.now()}_${repeatCount}`);
      if (this.processedGiftMsgIds.has(msgId)) return;
      this.processedGiftMsgIds.add(msgId);
      if (this.processedGiftMsgIds.size > 600) {
        const oldest = this.processedGiftMsgIds.keys().next().value;
        this.processedGiftMsgIds.delete(oldest);
      }

      const totalDiamonds = Math.max(1, diamondCount * repeatCount);
      const payload = {
        ...user,
        giftId: data.giftId,
        giftName,
        giftType,
        diamondCount,
        repeatCount,
        totalDiamonds
      };

      this.io.emit("tiktok_gift", payload);
      this._emitLocal("gift", payload);
    });

    // 4. MEMBER
    conn.on(WebcastEvent.MEMBER, (data) => {
      const user = SharedTikTokService.extractUserInfo(data, "Người Xem");
      this.io.emit("tiktok_member", user);
      this._emitLocal("member", user);
    });

    // 5. SHARE
    conn.on(WebcastEvent.SHARE, (data) => {
      const user = SharedTikTokService.extractUserInfo(data, "Người Xem");
      this.io.emit("tiktok_share", user);
      this._emitLocal("share", user);
    });

    // 6. CONTROL EVENTS
    conn.on(ControlEvent.DISCONNECTED, () => {
      this.state.connected = false;
      this.state.connecting = false;
      console.warn(`⚠️ [TikTok Live] Đã ngắt kết nối khỏi @${cleanUsername}`);
      this._broadcastStatus({ message: `Đã ngắt kết nối khỏi @${cleanUsername}` });
    });

    conn.on(ControlEvent.ERROR, (err) => {
      console.error("⚠️ [TikTok Live] Stream Error:", err?.info || err?.message || err);
    });
  }
}

module.exports = SharedTikTokService;
