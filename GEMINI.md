# Project Design & Architecture Rules

## 1. Kiến Trúc Multi-Project Dùng Chung (Shared Core)
- Mọi dự án game mới phải được tạo trong thư mục `games/<ten_du_an>/index.html` (và đăng ký thẻ mở nhanh trong `index.html` ở root nếu cần).
- **Không** tạo lại kết nối `tiktok-live-connector` riêng lẻ. Mọi game con kết nối tới `server.js` qua Socket.IO để nhận các sự kiện chuẩn hóa từ `core/tiktok-service.js`:
  - `tiktok_status`, `tiktok_chat`, `tiktok_like`, `tiktok_gift`, `tiktok_member`, `tiktok_share`
  - Gửi `connect_tiktok` / `disconnect_tiktok` để điều khiển kết nối chung.
- Giữ chuẩn khung hình dọc **9:16 TikTok Live**, chừa **15% vùng an toàn dưới cùng** cho khung chat mặc định của TikTok, có **Bảng Điều Khiển Test** bên ngoài (ẩn/hiện nhanh bằng phím `H`), và tích hợp **Web Worker 60FPS** chống đứng hình khi chuyển cửa sổ.

---

## 2. Quy Chuẩn Thiết Kế Giao Diện & Đồ Họa Nhân Vật (Full-Scene Illustrated & Character-Driven UI)
Khi xây dựng **dự án mới trong tương lai** (trừ khi có chỉ định khác), áp dụng phong cách **Sân Khấu Toàn Màn Hình + Nhân Vật Chi Tiết Kèm Tên & Avatar** (không lặp lại kiểu bóng tròn đơn điệu hay chia khung hộp gò bó):

### Bố cục Sân Khấu & HUD Nổi (Full-Bleed 9:16 + Translucent HUD)
- **Bối cảnh toàn màn hình có chiều sâu:** Dựng không gian sân khấu liền mạch theo đúng chủ đề (VD: phố xá, biệt phủ, đền đài, đấu trường...) chiếm trọn phần hiển thị phía trên, chừa **15% Safe Zone dưới cùng** sạch sẽ cho khung chat TikTok LIVE.
- **HUD bán trong suốt gọn gàng:**
  - **Thanh trên cùng:** Tiến trình vòng chơi, đồng hồ và thanh tỷ số đối đầu giữa các phe.
  - **Góc trên trái:** Bảng xếp hạng Top dẫn đầu (Top 3–5) nền mờ bán trong suốt, chữ rõ nét.
  - **Góc dưới phải (trên Safe Zone 15%):** Bảng hướng dẫn lệnh miễn phí & hiệu ứng quà tặng tối giản, bán trong suốt.
- **Typography tương phản cao:** Dùng Google Fonts hỗ trợ tiếng Việt tốt (`Baloo 2`, `Nunito`, `Fredoka`), kết hợp viền chữ (`text-shadow` / `strokeText`) đậm nét (`#1E1B18` / `#3D2C2E`) để dễ đọc trên mọi nền cảnh.

### Đồ Họa Nhân Vật & Thẻ Định Danh Người Chơi
- **Nhân vật có thân hình, trang phục & đạo cụ đặc trưng:**
  - Mỗi nhân vật phải được vẽ/hiển thị **đầy đủ dáng người, trang phục và đạo cụ đúng vai trò** (VD: Ăn Mày mặc quần áo rách rưới vá chằng, cầm bát ăn xin; Đại Gia mặc quần áo sáng bóng, xách túi tiền...). Không dùng một kiểu bóng tròn chung chung cho mọi dự án.
  - Có **chuyển động hành động trực tiếp** theo tương tác (giơ bát xin tiền, vung tay phát tiền, ném vật phẩm, tung chiêu đẩy lùi, choáng váng khi trúng đòn).
- **Avatar + Tên gắn liền từng nhân vật:**
  - Khi người xem comment tham gia, nhân vật của họ xuất hiện đúng phe/vị trí và **luôn gắn kèm Avatar tròn + Tên người chơi (+ điểm/cấp bậc)** ngay dưới chân hoặc trên đầu nhân vật.
- **Hào quang & Hiệu ứng (FX):**
  - Người dẫn đầu (Top 1 / Bang Chủ / Chủ Tịch) có **hào quang vàng rực rỡ xoay tròn** + danh hiệu nổi bật.
  - Hiệu ứng hạt (tiền bay, đồng xu leng keng, dép/vật phẩm bay, ánh sáng lấp lánh, rung màn hình) + Web Audio API sinh động.

---

## 3. Quy Chuẩn An Toàn Nội Dung & Giảm Rủi Ro Bị Quét TikTok LIVE
Mọi game mới phải thiết kế giao diện và kịch bản an toàn trước bộ lọc tự động (*Integrity and Authenticity* / OCR / Audio) của TikTok:
- **Tránh ngôn ngữ "Gift-baiting" & quy đổi điểm nhạy cảm:**
  - **Không** hiển thị bảng quy đổi kiểu `+20đ`, `+100đ`, `+500đ` hay các từ dễ bị hiểu nhầm là cá cược/câu quà trên màn hình công khai (như *"Lật kèo"*, *"Mua phiếu"*, *"Nạp quà"*).
  - Bảng quà tặng (nếu hiển thị) phải **tối giản, nền dịu nhẹ**, chỉ ghi tên hiệu ứng vui mang tính giải trí (VD: `🌹 Cổ vũ`, `🍩 Tăng tốc`, `⭐ Bứt phá`).
- **Tương tác miễn phí là trọng tâm:** Thanh hướng dẫn trên màn hình và lời thoại AI (TTS) luôn ưu tiên kêu gọi người xem **Comment**, **Thả tim**, và **Chia sẻ LIVE**; quà tặng chỉ đóng vai trò hiệu ứng cộng thêm.
- **Auto-Bot thông minh (Smart Idle Bot):** Bot chỉ chạy minh họa khi vắng tương tác và phải **tự động tạm dừng (tối thiểu 8 giây)** ngay khi có tương tác thật từ người xem để tránh giống phòng treo máy tự động.
- **Không gian cho người thật:** Giữ bố cục thoáng (ví dụ góc trên phải) để chủ phòng dễ đặt ô webcam nhỏ trên TikTok LIVE Studio và giao lưu micro trực tiếp.

---

## 4. Cơ Chế Giữ Chân & Kéo Tương Tác Người Xem (Engagement & Retention)
Áp dụng đồng bộ các cơ chế tạo cạnh tranh và giữ người xem ở lại lâu trên phiên LIVE:
- **Thưởng cho mọi tương tác miễn phí:**
  - Xử lý sự kiện **`tiktok_share` (Chia sẻ LIVE)** để cộng buff đẩy/tăng tốc + thông báo cảm ơn nổi bật (kèm cooldown chống spam và nút giả lập trong Bảng Điều Khiển Test).
- **Vinh danh "Lên hình" trực tiếp trong đấu trường:**
  - Người dẫn đầu (MVP) không chỉ nằm ở bảng thống kê mà phải có **hào quang + nhãn tên nổi (`👑 Tên`)** gắn trực tiếp trên nhân vật của họ trong Canvas.
- **Tiến trình Vòng / Giải đấu liên tục:**
  - Hiển thị rõ tiến trình vòng chơi (VD: `VỤ ÁN 1/12`, `CHẶNG 2/5`), đồng hồ đếm ngược, giai đoạn cao trào **30 giây cuối tăng tốc**, và màn hình tổng kết vinh danh MVP trước khi tự động chuyển vòng mới.
- **Phản hồi đa giác quan:** Kết hợp **giọng đọc AI (TTS) tiếng Việt** theo diễn biến trận đấu, **bong bóng thoại** theo chủ đề, và **biểu cảm động** (phe thắng hả hê, phe thua hoảng loạn, rung màn hình khi có tác động lớn).

Start-Process chrome.exe -ArgumentList "--user-data-dir=$env:TEMP\chrome-live-game", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--app=http://localhost:2222/games/anmayvsdaigia/"