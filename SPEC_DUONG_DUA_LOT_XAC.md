# ĐẶC TẢ KỸ THUẬT & THIẾT KẾ GAME TIKTOK LIVE
**Tên dự án:** Đường Đua Lột Xác — Mỹ Nhân Hay Thảm Họa? (Makeover Gate Runner 2D)
**Chuẩn hiển thị:** Màn hình dọc `9:16` (`1080 x 1920 px`), 60 FPS, hỗ trợ WebSocket `TikTok-Live-Connector`.

---

## 1. Bối Cảnh & Hệ Thống Kịch Bản (Context & Lore)

### Tiền đề câu chuyện
Một nhân vật chính (mặc định ở trạng thái mộc mạc, chưa trang điểm, mặc bộ đồ lót cơ bản trung tính) đang sải bước trên đại lộ dẫn tới một sự kiện quan trọng bậc nhất cuộc đời. Trên quãng đường này, nhân vật buộc phải đi qua **12 Cánh Cổng Định Mệnh**. Khán giả trong phòng live đóng vai trò là những "nhà tạo mẫu quyền lực" nắm giữ vận mệnh của nhân vật, chia thành 2 thế lực đối nghịch:
- **Phe Giải Cứu (`GÕ 1` — Cổng Trái — Xanh Cyan):** Những người có tâm hồn cái đẹp, muốn biến nhân vật thành Nữ Thần / Tổng Tài lộng lẫy để tỏa sáng và "dằn mặt" thiên hạ.
- **Phe Phá Đám / Troll (`GÕ 2` — Cổng Phải — Hồng/Đỏ):** Những "thánh lầy" thích tạo tiếng cười, cố tình nhét vào người nhân vật những món đồ chắp vá, kỳ quặc nhất để biến màn xuất hiện thành thảm họa tấu hài.

### Bộ 5 Kịch Bản Tình Huống (Tự động xoay vòng mỗi hiệp)
1. **Đám Cưới Người Yêu Cũ:** *"NYC gửi thiệp mời cưới kèm dòng chữ 'Không đi là hèn' — Mặc gì tới dự cho ngầu?"*
2. **Ra Mắt Gia Đình Hào Môn:** *"Lần đầu về ra mắt nhà bạn trai tài phiệt — Ghi điểm tuyệt đối hay bị đuổi thẳng cổ?"*
3. **Họp Lớp Sau 10 Năm:** *"Cả lớp toàn giám đốc với chủ tịch — Lên đồ sang chảnh hay giả nghèo thử lòng?"*
4. **Phỏng Vấn Thư Ký Chủ Tịch:** *"Buổi phỏng vấn quyết định lương 5.000 đô — Thần thái tổng tài hay thảm họa công sở?"*
5. **Thảm Đỏ Đêm Chung Kết:** *"Bước lên thảm đỏ trực tiếp toàn quốc — Nữ hoàng truyền thông hay tâm điểm meme?"*

---

## 2. Mục Tiêu Trò Chơi & Tâm Lý Vận Hành (Objectives)

### Mục tiêu của Người Chơi (Khán giả)
- **Mục tiêu phe phái:** Giành quyền kiểm soát từng cánh cổng trong 12 cổng để áp đặt món đồ của phe mình lên người nhân vật.
- **Mục tiêu cá nhân (Ego & Status):** Cạnh tranh điểm đóng góp để chiếm giữ 2 chiếc ghế danh vọng hiển thị cố định trên màn hình: **Nhà Tạo Mẫu Top 1** (Phe Xanh) và **Thánh Troll Top 1** (Phe Đỏ).
- **Mục tiêu giải trí:** Chứng kiến sự biến đổi ngoại hình từng giây của nhân vật (từ tóc, khuyên tai, tất chân đến phương tiện) và theo dõi màn kết cục bẽ bàng hoặc huy hoàng ở cuối đường đua.

### Mục tiêu của Hệ Thống (Thuật toán TikTok Live)
- **Tối đa hóa tốc độ bình luận (Comment Velocity):** Ép người xem liên tục gõ `1` hoặc `2` qua 12 chặng liên tiếp thay vì chỉ comment 1 lần đầu trận.
- **Tăng thời gian xem trung bình (Watch Time):** Nhịp thay đồ mỗi 10 giây giữ sự tò mò liên tục ("Cổng tiếp theo sẽ mặc gì?").
- **Tối ưu chuyển đổi quà tặng (Gift Conversion):** Tạo ra các khoảnh khắc "nghẹt thở" ở 3 giây cuối mỗi cổng và Cổng 12 X2 điểm để kích thích người chơi nạp xu khóa cổng hoặc lật kèo.

---

## 3. Vòng Lặp Trò Chơi Chi Tiết (Core Game Loop & State Machine)

Một hiệp đấu kéo dài đúng **145 giây (~2.5 phút)**, vận hành theo máy trạng thái gồm 4 pha khép kín:
[INTRO (5s)] ---> [12 CỔNG BIẾN HÌNH (12 x 10s = 120s)] ---> [CAO TRÀO CỔNG 12 (X2 Quà)] ---> [PHÁN QUYẾT SÂN KHẤU (15s)] ---> (Lặp lại Kịch bản mới)
### Pha 1: Khởi Động (`STATE_INTRO` — 5 giây)
- Hiển thị bảng thông báo kịch bản mới ở trung tâm màn hình kèm tiếng còi khai cuộc.
- Reset nhân vật về trạng thái **Cơ thể gốc (`base_body`)** chưa có phụ kiện.
- Reset điểm số hai phe và bảng xếp hạng MVP hiệp trước (lưu tên MVP hiệp trước vào dải băng "Kỷ lục gia vừa chiến thắng").

### Pha 2: Vòng Lặp 12 Cổng Biến Hình (`STATE_GATE_RUN` — 120 giây)
Nhân vật chạy bộ tại chỗ trên con đường 3D giả lập đang cuộn liên tục về phía trước. Lần lượt **12 cặp cổng** xuất hiện từ xa và tiến lại gần nhân vật. Mỗi cổng có vòng đời **10 giây**:
- **Giây thứ 0 – 7 (Giao tranh tự do):** Hai cánh cổng Trái (`1`) và Phải (`2`) hiển thị rõ hình ảnh món đồ tương ứng. Thanh tỷ số trên đầu cổng co giãn theo thời gian thực khi người xem comment hoặc thả quà.
- **Giây thứ 7 – 10 (Nước rút & Cảnh báo):** Viền cổng nhấp nháy, đồng hồ đếm ngược `3... 2... 1...` kèm tiếng tích tắc dồn dập. Đây là thời điểm vàng để người chơi thả quà **Khóa Cổng**.
- **Giây thứ 10 (Khoảnh khắc Va Chạm & Biến Hình):**
  - Cổng thắng mở tung với hiệu ứng **nổ hạt lấp lánh (Particles)**; cổng thua vỡ vụn thành mảnh nhỏ.
  - Món đồ thắng cuộc bay nhập vào nhân vật, cập nhật ngay lớp `z-index` tương ứng.
  - Nhân vật thực hiện hoạt ảnh nhảy cẫng (nếu nhận đồ đẹp) hoặc ôm đầu hoảng hốt/tấu hài (nếu nhận đồ thảm họa).
  - **MC Ảo (TTS)** đọc ngay một câu bình luận phản ứng với món đồ vừa mặc.

### Pha 3: Cao Trào Cổng Cuối (`STATE_CLIMAX_GATE_12` — 15 giây)
- Tại Cổng 12 (Phương tiện xuất hành), hệ thống kích hoạt hiệu ứng **SUDDEN DEATH — X2 SỨC MẠNH QUÀ TẶNG**.
- Toàn bộ viền màn hình chuyển sang hiệu ứng lửa cháy / điện giật neon, nhạc nền đẩy lên cao trào. Mọi món quà tặng trong 15 giây này được nhân đôi điểm số để quyết định phương tiện chốt hạ (Siêu xe Ferrari vs. Cưỡi lợn).

### Pha 4: Sân Khấu Phán Quyết (`STATE_VERDICT` — 15 giây)
- Con đường kết thúc, mở ra bối cảnh đích đến (ví dụ: *Sảnh Tiệc Cưới* hoặc *Thảm Đỏ*).
- Hệ thống tổng kết số món đồ đẹp vs. số món đồ thảm họa trên người nhân vật (tính theo tỷ lệ % trên 12 lớp) và kích hoạt đoạn kết tương ứng.

---

## 4. Kiến Trúc Kỹ Thuật 12 Lớp Ghép Ảnh & 12 Cổng Lựa Chọn

### Quy chuẩn Render 12 Lớp (`Zero-Offset Layer Stack`)
- Toàn bộ 12 lớp ảnh có kích thước canvas đồng nhất (`600 x 900 px`), vẽ đè tại cùng tọa độ `(0, 0)` theo thứ tự `z-index` từ dưới lên trên.
- **Fallback cho Prototype:** Nếu chưa có file PNG ngoài, `@builder-tester` phải dựng hệ thống vẽ vector sắc nét bằng **HTML5 Canvas / SVG** cho từng lớp để đảm bảo game chạy đầy đủ hiệu ứng ngay lập tức.

| Cổng | `z-index` | Mã lớp (`layerId`) | Phương án Trái (`GÕ 1` — Phe Giải Cứu) | Phương án Phải (`GÕ 2` — Phe Phá Đám) | Câu thoại MC Ảo (TTS) khi biến hình |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **0** | `z: 0` | `base_body` | *(Cố định)* Cơ thể gốc chuẩn tỷ lệ | *(Cố định)* Cơ thể gốc chuẩn tỷ lệ | *"Cuộc đua bắt đầu! Ai sẽ làm chủ diện mạo hôm nay?"* |
| **1** | `z: 8` | `makeup` | **Layout Nữ Thần:** Mắt long lanh, môi đỏ quyến rũ | **Mặt Nhọ Nồi:** Má hồng loang lổ, răng sún tấu hài | *"Khuôn mặt quyết định thần thái! Chị đẹp hay hề chúa đây?"* |
| **2** | `z: 3` | `hair_back` | **Tóc Mây Bồng Bềnh:** Tóc dài óng ả thướt tha | **Tóc Tổ Quạ:** Tóc xù dựng đứng dính cọng rơm | *"Ối giời ơi, quả đầu này ra đường chim nó làm tổ mất!"* |
| **3** | `z: 9` | `earrings` | **Khuyên Ngọc Bích:** Bông tai đá quý dài chạm vai | **Kẹp Phơi Đồ:** Hai chiếc kẹp quần áo xanh đỏ | *"Đôi khuyên tai độc lạ Bình Dương khiến cả sảnh ngoái nhìn!"* |
| **4** | `z: 10` | `eyewear` | **Kính Hiệu Gucci:** Kính râm viền vàng quý tộc | **Kính Bơi Mắt Lác:** Kính bơi nhựa màu hồng neon | *"Đeo kính này vào thì người yêu cũ cũng không nhận ra!"* |
| **5** | `z: 4` | `socks` | **Tất Lụa Hoa Văn:** Tất ren trắng tinh tế | **Tất Rách Cọc Cạch:** Một chiếc xanh, một chiếc thủng | *"Soi kỹ tới tận đôi tất chân, phe Troll không tha một ly!"* |
| **6** | `z: 5` | `footwear` | **Cao Gót Pha Lê:** Giày gót nhọn lấp lánh ánh kim | **Dép Tổ Ong Huyền Thoại:** Đứt quai dính bùn đất | *"Đôi dép tổ ong ngàn năm văn hiến chính thức lên chân!"* |
| **7** | `z: 6` | `outfit` | **Váy Dạ Hội / Phượng Bào:** Lộng lẫy dát vàng | **Bao Tải Thời Trang:** Áo bà ba chắp vá nhiều màu | *"Bộ cánh trị giá trăm củ hay bộ đồ ngủ đi đổ rác đây?"* |
| **8** | `z: 7` | `necklace` | **Chuỗi Kim Cương:** Dây chuyền đá quý bản lớn | **Vòng Cổ Tỏi Trừ Tà:** Xâu tỏi củ kết hợp xích nhựa | *"Đeo vòng tỏi thế này thì ma chê quỷ hờn luôn rồi!"* |
| **9** | `z: 11` | `headpiece` | **Vương Miện Nữ Hoàng:** Đính ngọc trai phát sáng | **Nồi Cơm Điện Úp Ngược:** Kèm khăn mặt vắt trán | *"Nồi cơm điện chống đạn chính thức đội lên đầu!"* |
| **10** | `z: 1` | `bg_aura` | **Cánh Tiên Hào Quang:** Cánh bướm phát sáng rực rỡ | **Mây Đen Sấm Sét:** Kèm đàn ruồi bay vo ve | *"Mang theo cả bầu trời u ám bước vào buổi tiệc!"* |
| **11** | `z: 12` | `handheld_pet` | **Túi Hiệu & Mèo Quý Tộc:** Túi vàng + mèo đội mũ | **Muôi Múc Canh & Vịt Kêu:** Cầm muôi + vịt chạy theo | *"Tay cầm muôi múc canh, chuẩn bị đi ăn cỗ trả thù!"* |
| **12** | `z: 2` | `vehicle` | **Siêu Xe Ferrari / Kiệu Rồng:** Xuất hành đẳng cấp | **Cưỡi Lợn Hồng / Xe Bò:** Chốt hạ màn xuất hiện | *"Cưỡi lợn tới thẳng cổng tiệc, huyền thoại ra đời!"* |

---

## 5. Cơ Chế Tương Tác, Vật Lý & Phễu Quà Tặng (Interaction & Monetization)

### A. Tương tác Miễn phí (Kéo thuật toán & Giữ chân)
1. **Bình luận chọn phe (`1` hoặc `2`):**
   - Chấp nhận các biến thể: `1`, `dep`, `cuu`, `xanh` (Phe 1) và `2`, `xau`, `troll`, `do`, `hong` (Phe 2).
   - **Hiệu ứng thị giác:** Một quả cầu mang **Avatar thật** của người comment bắn từ dưới lên, vẽ đường cong parabol đập thẳng vào cánh cổng họ chọn, làm cánh cổng rung lên và cộng `+1 điểm`.
   - **Chống spam (Anti-Spam):** Mỗi `userId` có cooldown `3 giây` cho mỗi lần tính điểm comment tại cùng một cổng.
2. **Cơ chế "Quay Xe / Phản Bội" (Betrayal):**
   - Nếu người chơi đã từng chọn Phe 1 ở cổng trước nhưng sang cổng sau lại gõ `2`, hệ thống kích hoạt thông báo chạy ngang màn hình: *"⚠️ [Tên] vừa quay xe sang Phe Phá Đám!"* kèm tiếng phanh xe kịch tính.
3. **Thả tim (`Like`):**
   - Cứ mỗi `10 tim` từ người chơi đã chọn phe sẽ bắn ra một **Tia Sét Mini** cộng `+2 điểm` vào cánh cổng của phe đó.

### B. Phễu Quà Tặng TikTok (3 Cấp Độ Chi Tiêu)
1. **Cấp 1 — Quà Nhỏ (1 xu — Hoa Hồng / GG):**
   - **Hiệu ứng:** Cộng ngay **`+25 điểm`** cho phe của người tặng.
   - **Hình ảnh:** Bắn một chùm 5 quả cầu avatar cỡ lớn kèm mưa hoa hồng (hoặc mưa cà chua thối) đập vỡ lá chắn của cổng đối phương.
   - **Âm thanh:** MC Ảo đọc to: *"Cảm ơn [Tên] vừa tung chiêu trợ giúp 25 điểm!"*.
2. **Cấp 2 — Quà Trung (10–30 xu — Tim Ngón Tay / Bánh Donut) — CHIÊU CHÍ MẠNG:**
   - **Hiệu ứng:** Cộng **`+150 điểm`** VÀ kích hoạt trạng thái **"KHÓA XÍCH CỔNG" (Gate Lock)** trong **4 giây**.
   - **Hình ảnh:** Một ổ khóa vàng khổng lồ kèm xích sắt quấn chặt lấy cánh cổng được chọn, đóng băng thanh tỷ số (mọi bình luận của phe kia bị bật nảy ra ngoài không tính điểm trong 4 giây). Nếu kích hoạt ở 4 giây cuối, nhân vật chắc chắn phải đi qua cổng đó.
3. **Cấp 3 — Quà Lớn (100+ xu — Corgi / Quà Lớn) — CHIÊU LẬT KÈO TOÀN DIỆN:**
   - **Hiệu ứng:** Cộng **`+500 điểm`** cho cổng hiện tại VÀ kích hoạt **"LỘT XÁC TOÀN BỘ" (Full Makeover)** (nếu Phe 1 tặng) hoặc **"NGUYỀN RỦA TOÀN TẬP" (Total Curse)** (nếu Phe 2 tặng).
   - **Hình ảnh:** Tia sét giáng xuống toàn màn hình, rung chấn mạnh 1.5 giây, tự động biến đổi **toàn bộ các lớp đồ đã mặc trước đó** trên người nhân vật sang đồng bộ 100% đồ VIP (hoặc 100% đồ Thảm Họa), bất chấp kết quả của các cổng trước.

---

## 6. Màn Cao Trào & Hiệu Ứng Kết Thúc (Climax & Retention)

Khi nhân vật vượt qua Cổng 12 và bước lên **Sân Khấu Phán Quyết**, màn hình chuyển sang góc máy cận cảnh (Zoom-in 1.3x) với 3 kịch bản kết cục dựa trên tỷ số cuối cùng:

1. **Kết Cục 1: Nữ Thần Đăng Quang (Phe Giải Cứu thắng >= 60%):**
   - Pháo hoa vàng bắn rợp trời, nhạc chiến thắng hào hùng nổi lên. Nhân vật tạo dáng kiêu sa, đám đông NPC xung quanh vỗ tay trầm trồ (người yêu cũ quỳ gối hối hận).
   - Vinh danh **Nhà Tạo Mẫu Đỉnh Nhất** (Avatar cỡ lớn đội vương miện).
2. **Kết Cục 2: Thảm Họa Huyền Thoại (Phe Phá Đám thắng >= 60%):**
   - Nhạc tấu hài vang lên, nhân vật bước xuống từ lưng lợn với đầu đội nồi cơm điện, tay cầm muôi múc canh khiến toàn bộ khách mời trên sân khấu ngã ngửa xỉu ngang.
   - Vinh danh **Chúa Tể Tấu Hài** (Avatar cỡ lớn đội mũ hề).
3. **Kết Cục 3: Lai Tạo Kỳ Dị (Tỷ số giằng co 45% – 55%):**
   - Nhân vật mang diện mạo "nửa tiên nửa quỷ" (ví dụ: mặc váy dạ hội dát vàng nhưng đi dép tổ ong và đội nồi cơm điện). Hệ thống bật hiệu ứng dấu chấm hỏi khổng lồ kèm câu thoại AI: *"Một phong cách thời trang vượt ngoài sức tưởng tượng của loài người!"*.

**Cơ chế giữ chân sang hiệp sau:** Ở giây thứ 12 của màn Phán Quyết, một thanh đếm ngược 3 giây hiện lên: *"Hiệp tiếp theo: [Tên Kịch Bản Mới] chuẩn bị bắt đầu!"* — giữ người xem ở lại phòng live liên tục qua nhiều hiệp.

---

## 7. Chuẩn Giao Diện Dọc 9:16 & Bảng Điều Khiển Streamer

### Bố cục 4 Vùng Trên Màn Hình Live (`1080 x 1920 px`)
1. **20% Trên cùng (Header):**
   - Khung tiêu đề kịch bản (chữ to, viền đậm tương phản cao).
   - Thanh tỷ số Tug-of-War (`Phe Giải Cứu %` vs `Phe Phá Đám %`) + Badge tiến trình **`Cổng X / 12`** + Đồng hồ đếm ngược cổng (`10s`).
2. **50% Trung tâm (Sân Khấu Chính):**
   - Phía trên: Con đường 3D giả lập và 2 cánh cổng Trái/Phải hiển thị hình minh họa món đồ sắp nhận.
   - Phía dưới: **Nhân vật 12 lớp** đứng trung tâm với kích thước đủ lớn để nhìn rõ từng chiếc khuyên tai, đôi tất, vòng cổ.
3. **15% Dưới giữa (Chỉ Dẫn & Vinh Danh):**
   - Hai nút lệnh nổi bật: **`GÕ 1` (LÀM ĐẸP)** và **`GÕ 2` (PHÁ ĐÁM)**.
   - Thanh quy đổi quà trực quan kèm icon TikTok: `Hoa Hồng (+25đ)` | `Donut (+150đ + Khóa Cổng)` | `Quà Lớn (+500đ + Lột Xác)`.
   - Hai thẻ **Top 1 MVP** của hai phe.
4. **15% Đáy màn hình (Safe Zone):**
   - Để trống hoàn toàn (chỉ hiển thị nền đường chạy) để tránh bị khung chat bình luận của TikTok Live che khuất.

### Bảng Điều Khiển Streamer (Control Panel — Phím tắt `H` để ẩn/hiện)
- **Kết nối Live:** Ô nhập ID TikTok + nút `Kết Nối / Ngắt Kết Nối` (`TikTok-Live-Connector`).
- **Quản lý Kịch bản:** Dropdown chọn 1 trong 5 kịch bản tình huống + nút `Chuyển Nhanh Tới Cổng Tiếp Theo` + nút `Reset Hiệp Mới`.
- **Bộ Nút Giả Lập Test Nhanh:** Ô nhập tên test, nút `Comment 1`, `Comment 2`, `Thả +10 Tim`, `Quà Nhỏ (+25đ)`, `Quà Trung (Khóa Cổng)`, `Quà Lớn (Lột Xác Toàn Bộ)`.
- **Tự Động Hóa (Dành cho Live không dùng Mic):**
  - Công tắc **`Auto-Bot`**: Tự sinh người chơi ảo tên tiếng Việt comment/tặng quà nhẹ nhàng để màn hình luôn sống động khi mới mở live.
  - Công tắc **`MC Ảo (TTS)`**: Tự động đọc bình luận người xem, đọc tên người tặng quà và tung câu cà khịa mỗi 10 giây.