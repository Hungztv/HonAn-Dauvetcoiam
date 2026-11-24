# BÁO CÁO TỔNG THỂ TOÀN DIỆN DỰ ÁN — HỒN ÁN: DẤU VẾT CÕI ÂM (v6.0)

> **Thể loại:** Webgame 3D Kinh Dị Tâm Lý – Điều Tra Tâm Linh Việt Nam Thập Niên 1990–2000 (Góc nhìn thứ nhất / First-Person)  
> **Phiên bản hiện tại:** `v6.0` (Hồ Sơ Đồi Sương Lâm Viên, Map Lớn `56×56m–64×64m`, Chứng Cứ Ngụy Tạo, 4 Mật Vật & Kết Cục Bí Mật Thứ 4, Điểm Ẩn Nấp, Nhang Trầm Hộ Mệnh & Bản Đồ Hiện Trường)  
> **Chuẩn cốt truyện:** Narrative Pack `v6.0` — *Hồ Sơ Đồi Sương Lâm Viên (1994–2004)*  
> **Chuẩn lưu dữ liệu:** Save Schema `v5` (`localStorage` key: `hon_an_save_v6`)  
> **Kho lưu trữ GitHub:** [https://github.com/Hungztv/HonAn-Dauvetcoiam.git](https://github.com/Hungztv/HonAn-Dauvetcoiam.git) (nhánh `main` — tự động deploy Vercel qua `vercel.json`)  
> **Trạng thái kiểm thử:** **35/35 Vitest tests PASS**, **`tsc -b && vite build` PASS (0 lỗi, 4.25s)**, **Live Browser QA PASS (0 console/page error)**.

---

## MỤC LỤC

1. [Tổng Quan Dự Án & Công Nghệ](#1-tổng-quan-dự-án--công-nghệ)
2. [Cấu Trúc Thư Mục & Các Phân Hệ Chính](#2-cấu-trúc-thư-mục--các-phân-hệ-chính)
3. [Chi Tiết Cốt Truyện Mới v6.0 — Hồ Sơ Đồi Sương Lâm Viên (1994–2004)](#3-chi-tiết-cốt-truyện-mới-v60--hồ-sơ-đồi-sương-lâm-viên-19942004)
4. [Hồ Sơ Chi Tiết Toàn Bộ 5 Màn Chơi Mở Rộng (`56×56m` → `64×64m`)](#4-hồ-sơ-chi-tiết-toàn-bộ-5-màn-chơi-mở-rộng-5656m--6464m)
5. [Hệ Thống Sinh Tồn Nhẹ, Bản Đồ Hiện Trường & Chứng Cứ Ngụy Tạo (v6.0)](#5-hệ-thống-sinh-tồn-nhẹ-bản-đồ-hiện-trường--chứng-cứ-ngụy-tạo-v60)
6. [Hệ Thống NPC Ma 3D, Rigging, Animation, AI Level 3 & Physical Jumpscare (v5.0–v5.1)](#6-hệ-thống-npc-ma-3d-rigging-animation-ai-level-3--physical-jumpscare-v50v51)
7. [Hệ Thống Đồ Họa 3D PBR, GLB Asset Pipeline & Âm Thanh 3D HRTF](#7-hệ-thống-đồ-họa-3d-pbr-glb-asset-pipeline--âm-thanh-3d-hrtf)
8. [Quản Lý Trạng Thái (Zustand), Save Schema v5, UI/UX & Phím Tắt](#8-quản-lý-trạng-thái-zustand-save-schema-v5-uiux--phím-tắt)
9. [Kết Quả Kiểm Thử QA & Lịch Sử Phiên Bản](#9-kết-quả-kiểm-thử-qa--lịch-sử-phiên-bản)
10. [Các Hạng Mục Còn Thiếu (BLOCKED) & Hướng Dẫn Tích Hợp Asset Blender / Audio](#10-các-hạng-mục-còn-thiếu-blocked--hướng-dẫn-tích-hợp-asset-blender--audio)

---

## 1. TỔNG QUAN DỰ ÁN & CÔNG NGHỆ

### 1.1. Tầm nhìn & Định hướng v6.0
**HỒN ÁN v6.0 – HỒ SƠ ĐỒI SƯƠNG LÂM VIÊN** đưa người chơi vào vai **Lâm Hoàng Quân** (phóng viên điều tra hình sự, 26 tuổi) trở lại thị trấn cao nguyên sương mù **Lâm Viên** đúng đêm **14/11/2004** sau khi nhận được một cuộn băng cassette nặc danh thu giọng em gái song sinh **Lâm Hạ Vy** đã mất tích 2 năm trước.

Trò chơi kết hợp 5 trụ cột gameplay:
1. **Khám phá 3D góc nhìn thứ nhất trên bản đồ rộng gấp ~6–9 lần diện tích cũ (`56×56m` đến `64×64m`)**: khu tập thể cũ K7 năm 2002, trường nội trú Đồi Sương năm 2000, khu cách ly B3 viện điều dưỡng rừng thông năm 1998, nhà văn hóa & đài phát sóng thị trấn mỏ năm 1994, và bến phà đập thủy điện đêm sương năm 2004.
2. **Soi vật chứng 3D xoay 360° & Phân tích Chứng cứ Ngụy tạo (Red Herrings)**: phân biệt chứng cứ thật với biên bản giả do đường dây che đậy dựng lên (`isRedHerring: true`, không được tính vào chỉ tiêu mở khóa Tầng 2).
3. **Điều tra logic 3 tầng (Tier 1–2–3), Sổ Điều Tra 6 tab & Phòng Mật Ẩn**: tìm **4 Chân Lý Cốt Lõi** và khám phá **4 Phòng Mật Ẩn** thu thập **4 Mật Vật (`SECRET_RELIC_IDS`)** để mở khóa **Kết Cục Bí Mật Thứ 4 (`secret_ending`)**.
4. **Sinh tồn & Ẩn nấp nhẹ trên map rộng**: chui vào **Điểm Ẩn Nấp 3D (`[E]`)** để cắt tầm nhìn (LOS) của ma và đốt **Nhang Trầm Hộ Mệnh (`[Q]`)** đẩy lùi thực thể 3D trong bán kính `15.5m`.
5. **6 nhóm NPC Ma 3D toàn thân & Physical 3D Jumpscare**: 15 khớp xương, 16 animation clips, AI Level 3 (LOS ray-march `0.15m`, FOV, phản ứng đèn pin, rình rập waypoint tầm xa `48m`) và 8 kiểu Jumpscare vật lý A–H (0% ảnh ma 2D/SVG).

### 1.2. Công nghệ & Phiên bản thực tế (`package.json`)

| Nhóm | Thư viện / Công cụ | Phiên bản | Vai trò |
| :--- | :--- | :--- | :--- |
| Core UI | `react`, `react-dom` | `^18.3.1` | Giao diện HUD, Minimap, Modal, Menu, Sổ Điều Tra 6 tab |
| Language | `typescript` | `^5.6.3` | Kiểu dữ liệu chặt chẽ toàn bộ dự án |
| Build Tool | `vite`, `@tailwindcss/vite` | `^6.2.0` / `^4.0.14` | Dev server HMR, code-splitting production bundle |
| 3D Engine | `three` | `^0.169.0` | WebGL rendering, PBR materials, Skeleton/SkinnedMesh |
| React 3D | `@react-three/fiber`, `@react-three/drei` | `^8.17.10` / `^9.117.3` | Khai báo scene 3D, camera (`far: 145`), lighting |
| Post-FX | `@react-three/postprocessing`, `postprocessing` | `^2.16.3` / `^6.36.4` | Bloom tiết chế, Vignette, Noise film grain, ChromaticAberration |
| State | `zustand` | `^5.0.2` | Single source of truth, Save Schema v5, Narrative v6.0 |
| Animation UI | `framer-motion` | `^11.15.0` | Hiệu ứng chuyển màn, mở sổ, mở modal, toast |
| Icons | `lucide-react` | `^0.468.0` | Hệ thống biểu tượng UI |
| Testing | `vitest` | `^2.1.8` | 4 tệp / 35 bài unit & integration tests tự động |

---

## 2. CẤU TRÚC THƯ MỤC & CÁC PHÂN HỆ CHÍNH

```text
hon-an/
├── docs/
│   └── BLENDER_CHARACTER_SPEC_v5.1.md  # Quy chuẩn xuất nhân vật GLB Blender 15 xương + PBR
├── public/                             # Thư mục đặt asset .glb và .ogg/.mp3 mở rộng
├── vercel.json                         # Cấu hình SPA rewrite & cache static assets cho Vercel
├── PROJECT_FULL_REPORT.md              # Báo cáo tổng thể toàn diện dự án (v6.0)
├── project-report.html                 # Báo cáo tiến độ HTML tương tác (v6.0)
├── package.json
└── src/
    ├── App.tsx                         # Điều phối màn hình, Canvas 3D (far: 145), HUD, Modals
    ├── __tests__/                      # 4 tệp kiểm thử tự động Vitest (35/35 tests PASS)
    │   ├── levelsAndPuzzles.test.ts    # Toàn vẹn 5 map lớn, mật mã, red herrings, mật vật, hiding spots
    │   ├── narrativeAndSave.test.ts    # Narrative v6.0, 4 Kết cục (kể cả Secret Ending), Save v5
    │   ├── npcAndJumpscare.test.ts     # 6 NPC 3D, FSM, LOS, Hiding Spot stealth, Scare A–H
    │   └── v51Pipeline.test.ts         # Validator GLB v5.1, Mixamo/Rigify alias, AudioBuffer layer
    ├── audio/
    │   └── horrorAudio.ts              # Web Audio 3D HRTF + lớp phát AudioBuffer .ogg/.mp3
    ├── components/
    │   ├── FieldMap.tsx                # [MỚI v6.0] Minimap HUD góc trái + Bản Đồ Kiến Trúc Hiện Trường
    │   ├── HUD.tsx                     # Tâm ngắm, pin đèn pin, Nhang Trầm [Q], trạng thái ẩn nấp [E], Minimap [M]
    │   ├── InspectModal.tsx            # Studio 3D xoay 360°, nhãn Ngụy tạo / Mật vật ẩn
    │   ├── InventoryModal.tsx          # Túi đồ vật chứng (phím I)
    │   ├── InvestigationJournal.tsx    # Sổ điều tra 6 Tab (thêm Bản Đồ Hiện Trường & Sổ Mật Vật x/4)
    │   ├── JumpscareOverlay.tsx        # Hiệu ứng hậu kỳ phụ trợ (0% ảnh ma 2D)
    │   ├── MainMenu.tsx                # Menu chính v6.0, Chọn 5 chương, Cài đặt, NG+
    │   ├── PauseMenu.tsx               # Menu tạm dừng (phím ESC)
    │   ├── PuzzleModal.tsx             # Giải đố 3 cơ chế + Lựa chọn Đạo đức + 3 tầng gợi ý
    │   └── StoryScreens.tsx            # Intro từng chương, Hoàn thành màn, 4 Màn hình Kết Cục
    ├── data/
    │   ├── narrativePack.ts            # Kinh thánh cốt truyện v6.0: Đồi Sương Lâm Viên, 4 Truths, 4 Relics, 4 Endings
    │   └── levels/
    │       ├── level1.ts               # Hồ Sơ 01 (2002): Khu Tập Thể Cũ K7 (56×56m)
    │       ├── level2.ts               # Hồ Sơ 02 (2000): Trường Nội Trú Đồi Sương (60×60m)
    │       ├── level3.ts               # Hồ Sơ 03 (1998): Viện Điều Dưỡng Lâm Viên – Khu B3 (62×62m)
    │       ├── level4.ts               # Hồ Sơ 04 (1994): Nhà Văn Hóa & Đài Phát Sóng Đồi Bắc (60×60m)
    │       └── level5.ts               # Hồ Sơ 05 (2004): Bến Phà Đập Thủy Điện Đêm Sương (64×64m)
    ├── horror/
    │   ├── characters/                 # 6 nhân vật Ma 3D + GLBNPCModel.tsx
    │   ├── debug/                      # NPCDebugPanel.tsx (F9 / ?debug=1)
    │   ├── jumpscare/                  # JumpscareTriggers.ts, PhysicalJumpscareDirector.ts, JumpscareAudio.ts
    │   └── npc/                        # AI Level 3, Waypoints 60m, LOS, Repel Nhang Trầm, Hiding Spot
    ├── store/
    │   └── gameStore.ts                # Zustand store, Save Schema v5 (hon_an_save_v6), Hiding & Incense logic
    ├── three/
    │   ├── AssetPipeline.ts            # GLTF + Draco + KTX2 + LOD + Quality Profiles
    │   ├── AtmosphericEffects.tsx      # Sương mù tầm xa, mưa đêm 54–62m, bụi sáng
    │   ├── EvidenceModels.tsx          # 17 mẫu vật chứng 3D + hotspots ẩn
    │   ├── FirstPersonController.tsx   # Điều khiển FPS, Ẩn nấp [E], Đốt nhang [Q], Đèn pin [F]
    │   ├── HorrorPostProcessing.tsx    # ACES Filmic, Bloom, Vignette, Film Grain
    │   ├── LevelEnvironment.tsx        # Dựng kiến trúc 3D 5 map lớn + Điểm ẩn nấp 3D (Tủ sắt/Rèm/Gầm cầu thang)
    │   ├── ModelSlot.tsx               # Slot thay thế GLB tự động
    │   ├── proceduralTextures.ts       # Engine sinh PBR Albedo + Sobel Normal + Roughness 512px
    │   ├── VietnameseProps.tsx         # Bốt điện thoại thẻ 2000s, phà sắt thủy điện, nhang khói, đạo cụ
    │   └── VisualStandard.ts           # Chuẩn hình ảnh thống nhất
    └── types/
        └── game.ts                     # HidingSpot, MapZoneLabel, SecretRelicId, Red Herring flags
```

---

## 3. CHI TIẾT CỐT TRUYỆN MỚI v6.0 — HỒ SƠ ĐỒI SƯƠNG LÂM VIÊN (1994–2004)

Nguồn chân lý cốt truyện nằm tại `src/data/narrativePack.ts` (`NARRATIVE_VERSION = '6.0'`).

### 3.1. Bối cảnh & Dòng thời gian 10 năm (1994 – 2004)
Tại thị trấn cao nguyên **Lâm Viên**, dưới vỏ bọc **"Dự Án Thanh Lọc Ký Ức Lâm Viên"** do **Bác sĩ Vũ Đình Bách** (Viện trưởng Viện Điều Dưỡng) và **Hiệu phó Trần Quốc Bảo** cầm đầu, hàng loạt học sinh nội trú và nhân chứng đã bị cưỡng bức thử nghiệm sốc điện – thôi miên xóa trí nhớ tại **Khu Cách Ly B3** rồi làm giả hồ sơ tử vong/bỏ trốn:

| Mốc thời gian | Địa điểm | Nạn nhân / Nhân chứng | Kỷ vật mở khóa | Biến cố thực sự bị che giấu |
| :--- | :--- | :--- | :--- | :--- |
| **1994** | **Nhà Văn Hóa & Đài Phát Sóng Đồi Bắc** | Kỹ thuật viên **Ông Hòa** | **Cuộn Phim 35mm** | Ông Hòa thu được băng gốc và phim 35mm ghi cảnh nhóm Bác sĩ Bách lập danh sách thử nghiệm đầu tiên. Ông bị sát hại ngay trong buồng máy chiếu, dựng hiện trường giả là chập điện cháy rạp. |
| **1998** | **Viện Điều Dưỡng Lâm Viên – Khu B3** | Bệnh nhi **Bé Minh (`B3-04`)** & **Quân (`B3-09`)** | **Thẻ Bệnh Án B3** | Bé Minh tử vong dưới bể ngầm thủy trị liệu Khu B3. Chính **Lâm Hoàng Quân (`B3-09`)** lúc thiếu thời cũng từng bị giam tại đây; người cha **Lâm Văn Khải** (nhân viên gác phà thủy điện) đã liều mạng đánh cắp con trai đưa xuống phố, khiến Quân mất sạch ký ức tuổi thơ. |
| **2000** | **Trường Nội Trú Đồi Sương** | Nữ sinh phát thanh **Đào Thị Mây** | **Huy Hiệu Phát Thanh** | Đào Thị Mây phát hiện danh sách học sinh bị chuyển lén sang Khu B3 và định đọc lên sóng phát thanh trường. Cô bị Hiệu phó Bảo nhốt dưới hầm sân khấu hội trường đến chết ngạt, rồi ngụy tạo bức thư tuyệt mệnh đánh máy. |
| **2002** | **Khu Tập Thể Cũ K7 (Phòng 404)** | Em gái **Lâm Hạ Vy** & Y tá **Nguyễn Thu Hà** | **Băng Đỏ 404** | Hạ Vy và y tá Thu Hà gom đủ chứng cứ tại Phòng 404 Khu K7. Đêm cắt điện, tay chân của Bách ập tới bắt cóc Hạ Vy; ông Khải buộc phải khóa trái cửa thép Phòng 404 từ bên ngoài để bảo vệ kho hồ sơ và che giấu dấu vết cho Quân. |
| **14/11/2004** | **Bến Phà Đập Thủy Điện Đêm Sương** | **Lâm Văn Khải** & 4 chứng nhân cõi âm | **Đủ 4 Kỷ Vật** | Đêm trước ngày đóng cống tích nước nhấn chìm toàn bộ thung lũng Lâm Viên vĩnh viễn dưới lòng hồ thủy điện, Quân quay về đối mặt sự thật, thu thập 4 Chân Lý + 4 Mật Vật và đưa ra phán quyết cuối cùng trên chuyến phà 03:15 sáng. |

### 3.2. Trình tự mở khóa Bến Phà Thủy Điện
- **Chuỗi 4 kỷ vật chuẩn:** `Băng Đỏ → Huy Hiệu → Thẻ B3 → Cuộn Phim` (tương ứng hành trình điều tra ngược thời gian `2002 → 2000 → 1998 → 1994`).

### 3.3. Bốn Kết Cục (`EndingId`) — Bao gồm Kết Cục Bí Mật Thứ 4
1. **KẾT CỤC BÍ MẬT THỨ 4 — BẢN TIN PHÁT SÓNG LÚC BÌNH MINH (`secret_ending`)** *(Mới v6.0)*
   - **Điều kiện:** Đủ **4/4 Chân Lý Cốt Lõi** + Đủ **4/4 Mật Vật Ẩn (`secretRelics`)** + **`spiritScore === +2`** (`release` + `reveal`) + **`judgment === 'forgive'`**.
   - **Nội dung:** Quân kết nối máy phát sóng dự phòng trên đài kiểm soát đập thủy điện, phát trực tiếp toàn bộ 4 mật vật gốc (Băng gốc Hạ Vy, Huy hiệu ghi âm Mây, Vòng tay B3-09, Cuộn phim âm bản 1994) sang tần số tỉnh lỵ ngay trước giờ xả lũ. Bác sĩ Bách và Hiệu phó Bảo bị bắt giữ, hồ sơ oan khuất 10 năm được phơi bày trọn vẹn dưới ánh bình minh.
2. **KẾT CỤC THẬT — ÁNH ĐÈN PHA QUA MẶT HỒ SƯƠNG (`true_ending`)**
   - **Điều kiện:** Đủ **4/4 Chân Lý Cốt Lõi** + **`spiritScore === +2`** + **`judgment === 'forgive'`** (nhưng chưa thu thập đủ 4 Mật Vật ẩn).
3. **KẾT CỤC NGẬM NGÙI — CHUYẾN PHÀ CUỐI RỜI ĐẬP (`bittersweet_ending`)**
   - **Điều kiện:** Đủ **4/4 Chân Lý Cốt Lõi** + **`spiritScore === +2`** + **`judgment === 'condemn'`**.
4. **KẾT CỤC BÓNG TỐI — ĐÁY HỒ THỦY ĐIỆN KHÔNG TÊN (`dark_ending`)**
   - **Điều kiện:** Thiếu Chân Lý Cốt Lõi hoặc `spiritScore < 2` (tự phân loại chính xác `incomplete_truth`, `compromised_conscience`, `judgment_missing`, `multiple`).

---

## 4. HỒ SƠ CHI TIẾT TOÀN BỘ 5 MÀN CHƠI MỞ RỘNG (`56×56m` → `64×64m`)

| Màn | Tên Hồ Sơ & Năm | Kích thước Map | Các phân khu kiến trúc chính | Mật mã / Chuỗi Tầng 2 | Chứng cứ Ngụy tạo (Red Herring) | Phòng Mật & Mật Vật Ẩn |
| :-: | :--- | :---: | :--- | :--- | :--- | :--- |
| **1** | **Khu Tập Thể Cũ K7** (`2002`) | **`56m × 56m`** | Sân bốt điện thoại thẻ, Cầu thang trung tâm, Dãy A (P.401–402), Dãy B, Phòng 404 khóa thép, Nhà để xe, **Trạm biến thế sau sân** | Tủ Cầu Dao K7: **`4 - 0 - 2 - 2`** | *Giấy đòi nợ viết tay gài cửa* (gợi số giả `9900`) | Trạm biến thế (`door_l1_substation`) → **`relic_l1_cassette`** (*Băng Cassette Gốc Của Hạ Vy*) |
| **2** | **Trường Nội Trú Đồi Sương** (`2000`) | **`60m × 60m`** | Cổng bảo vệ, Sân cờ & cây thông già, Dãy học Đông, Ký túc xá Tây, Phòng Phát Thanh, Hội trường Bắc, **Hầm Sân Khấu** | Bàn Trộn Phát Thanh: **`step_tay → step_hon → step_danh → step_oan`** | *Thư tuyệt mệnh đánh máy sạch sẽ* | Hầm Sân Khấu (`door_l2_stage_basement`) → **`relic_l2_badge`** (*Huy Hiệu Phát Thanh Đẫm Lệ*) |
| **3** | **Viện Điều Dưỡng Lâm Viên – Khu B3** (`1998`) | **`62m × 62m`** | Cổng gác rừng thông, Sân bể ngầm thủy trị liệu, Khoa Dược Đông, Buồng Cách Ly Tây, Văn phòng Viện trưởng Bách, **Buồng Tối X-Quang** | Van Xả Bể Ngầm: **`1 - 9 - 9 - 8`** | *Giấy báo tử sao chép ghi sai năm 2001* | Buồng Tối X-Quang (`door_l3_xray_room`) → **`relic_l3_wristband`** (*Vòng Tay Bệnh Nhi B3-09*) |
| **4** | **Nhà Văn Hóa & Đài Phát Sóng Đồi Bắc** (`1994`) | **`60m × 60m`** | Quảng trường mỏ cũ, Khán phòng rạp bóng, Cánh trưng bày Tây, Buồng máy chiếu Đông, Đài truyền thanh Bắc, **Buồng Rửa Phim 35mm** | Trống Từ 4 Kênh: **`drum_dong → drum_nam → drum_tay → drum_bac`** | *Biên bản chập điện máy chiếu giả* | Buồng Rửa Phim (`door_l4_darkroom`) → **`relic_l4_film_reel`** (*Cuộn Phim Âm Bản 35mm Năm 1994*) |
| **5** | **Bến Phà Đập Thủy Điện Đêm Sương** (`2004`) | **`64m × 64m`** | Dốc bê tông bờ đập, Nhà điều hành cống xả, Kho phao cứu sinh Đông, Cầu dẫn phà sắt, **Boong Phà Thủy Điện Sương Mù** | Hộp Khóa Cầu Phà: **`Băng Đỏ → Huy Hiệu → Thẻ B3 → Cuộn Phim`** | *Bản tin tai nạn đuối nước soạn sẵn* | Tích hợp phán quyết cuối & kiểm tra đủ `4/4` Mật Vật mở `secret_ending` |

---

## 5. HỆ THỐNG SINH TỒN NHẸ, BẢN ĐỒ HIỆN TRƯỜNG & CHỨNG CỨ NGỤY TẠO (v6.0)

### 5.1. Điểm Ẩn Nấp 3D (`HidingSpot` — Phím `[E]`)
- Mỗi màn bố trí **2–3 điểm ẩn nấp 3D thực tế** (`steel_locker` tủ sắt công nhân/học sinh, `curtain_alcove` rèm y tế/phông nhung sân khấu, `under_stairs` hốc gầm cầu thang/trạm gác) với tổng cộng **14 điểm ẩn nấp** qua 5 màn.
- Khi nhấn `[E]` chui vào điểm ẩn nấp:
  - Đèn pin tự động tắt để tránh lộ vị trí, camera chuyển góc nhìn khe hẹp trong chỗ trốn.
  - `NPCPerception.ts` cắt hoàn toàn tầm nhìn (`hasLineOfSight = false`, `inPlayerFlashlight = false`), giúp thoát truy đuổi của ma trên bản đồ lớn.
  - Tự động chặn kích hoạt bẫy proximity jumpscare khi đang nấp an toàn.

### 5.2. Nhang Trầm Hộ Mệnh (`Incense Ward` — Phím `[Q]`)
- Người chơi khởi đầu mỗi màn với **2 nén Nhang Trầm**, và mỗi lần tìm thấy **1 Mật Vật Ẩn (`Secret Relic`)** sẽ được thưởng thêm **+1 nén** (tối đa 5 nén).
- Nhấn `[Q]` đốt nhang tạo luồng thanh tịnh đẩy lùi toàn bộ NPC ma thù địch trong bán kính **`15.5m`** sang trạng thái `Retreating` suốt **6 giây**, đồng thời hạ `horrorIntensity`.

### 5.3. Bản Đồ Kiến Trúc Hiện Trường & Live Minimap (`FieldMap.tsx` — Phím `[M]` & `Tab`)
- **HUD Live Minimap (`[M]` bật/tắt):** Hiển thị trực tiếp ở góc dưới bên trái màn hình với tọa độ người chơi thời gian thực, hướng nhìn hình nón (FOV cone), tường kiến trúc, cánh cửa khóa/mở, trạm giải đố và các điểm ẩn nấp.
- **Tab thứ 6 "Bản Đồ Hiện Trường" trong Sổ Điều Tra (`Tab`):** Bản vẽ mặt bằng quy hoạch chi tiết hiển thị đầy đủ nhãn tên toàn bộ 5–7 phân khu của từng màn, chú giải ký hiệu và tiến độ thu thập Mật Vật (`x/4`).

### 5.4. Chứng Cứ Ngụy Tạo (`isRedHerring`)
- Mỗi màn cài cắm biên bản/chứng cứ giả do Bác sĩ Bách và Hiệu phó Bảo ngụy tạo.
- Trong `InspectModal` và `InvestigationJournal`, các manh mối này mang nhãn cảnh báo **`NGHI VẤN / NGỤY TẠO`** và **không được tính vào số manh mối xác thực** cần thiết để mở khóa giải đố Tầng 2 (`authenticClueCount`).

---

## 6. HỆ THỐNG NPC MA 3D, RIGGING, ANIMATION, AI LEVEL 3 & PHYSICAL JUMPSCARE (v5.0–v5.1)

- **0% ảnh ma 2D / 0% SVG ma jumpscare:** Toàn bộ 6 nhóm thực thể (`dao_thi_may`, `tran_thi_lien`, `child_spirit`, `wooden_statue`, `faceless_passenger`, `ferryman`) là mô hình 3D có khớp nối thực tế trong không gian Three.js.
- **Tầm hoạt động mở rộng cho Map 60m:** Khoảng cách kích hoạt AI & render nâng lên **`48m`**, ray-march LOS nâng lên **`40m`**, mạng lưới `LEVEL_STALK_WAYPOINTS` phủ khắp các dãy hành lang và sân rộng của 5 màn mới.
- **GLB Character Pipeline v5.1 (`GLBNPCModel.tsx` & `NPCModelValidator.ts`):** Hỗ trợ nạp trực tiếp nhân vật `.glb` từ Blender (tự ánh xạ tên xương Mixamo `mixamorigHips` / Rigify `DEF-spine`, kiểm tra skin weights, chiều cao `0.55m–2.65m`, PBR materials, LOD và tự động fallback mượt về rig procedural nếu chưa có file `.glb`).

---

## 7. HỆ THỐNG ĐỒ HỌA 3D PBR, GLB ASSET PIPELINE & ÂM THANH 3D HRTF

- **Camera & Sương mù tầm xa:** Camera `far: 145`, sương mù đa lớp (`fogNear / fogFar` tinh chỉnh riêng cho từng map `56–64m`), hạt mưa đêm phủ rộng `54–62m`, mặt hồ thủy điện `66×44m` và phà sắt mái tôn ở Màn 5.
- **Vật liệu PBR 512px (`proceduralTextures.ts`):** Albedo + Sobel RGB Normal Map + Roughness + Flashlight Lens Cookie.
- **Âm thanh 3D HRTF (`horrorAudio.ts`):** Kết hợp tổng hợp thời gian thực Web Audio API với lớp nạp `AudioBuffer` `.ogg/.mp3` định vị không gian 3D qua `PannerNode`.

---

## 8. QUẢN LÝ TRẠNG THÁI (ZUSTAND), SAVE SCHEMA v5, UI/UX & PHÍM TẮT

- **Save Schema v5 (`SAVE_SCHEMA_VERSION = 5`, key `hon_an_save_v6`):** Lưu trữ đầy đủ `secretRelics`, `incenseCharges`, `showMinimap`, `moralChoices`, `coreTruths`, `completedEndings` và tự động kẹp tọa độ an toàn theo kích thước map mới.

| Phím / Thao tác | Chức năng |
| :--- | :--- |
| `W / A / S / D` + `Chuột` | Di chuyển 4 hướng & xoay góc nhìn 360° |
| `Shift` / `C` (`Ctrl`) | Chạy nhanh / Ngồi xuống giảm tiếng ồn |
| `F` | Bật / Tắt đèn pin cầm tay |
| `E` | Nhặt & soi vật chứng 3D, Mở/Đóng cửa, Giải đố, **Chui vào / Bước ra Điểm Ẩn Nấp** |
| `Q` *(Mới v6.0)* | **Đốt Nhang Trầm Hộ Mệnh** đẩy lùi ma 3D trong bán kính `15.5m` |
| `M` *(Mới v6.0)* | **Bật / Tắt Live Minimap** góc dưới bên trái HUD |
| `Tab` | Mở / Đóng **Sổ Điều Tra 6 Tab** (gồm *Bản Đồ Hiện Trường* & *Mật Vật Ẩn*) |
| `I` / `ESC` | Túi đồ vật chứng / Menu Tạm Dừng |
| `F9` *(DEV / `?debug=1`)* | Bật / Tắt **3D NPC Debug Panel v5.1** |

---

## 9. KẾT QUẢ KIỂM THỬ QA & LỊCH SỬ PHIÊN BẢN

- **Vitest (`npm.cmd test`):** **4 tệp / 35/35 tests PASS** (`levelsAndPuzzles.test.ts`, `narrativeAndSave.test.ts`, `npcAndJumpscare.test.ts`, `v51Pipeline.test.ts`).
- **Production Build (`npm.cmd run build`):** **`tsc -b && vite build` PASS trong `4.25s`** (0 lỗi TypeScript).
- **Live Browser QA (`http://localhost:5173/`):** **0 console/page errors**, xác nhận đầy đủ Menu v6.0, Khu Tập Thể K7 `56×56m`, Live Minimap `[M]`, Nhang Trầm `[Q]`, và tab `Bản Đồ Hiện Trường` 7 phân khu.

### Lịch sử phiên bản chính
- **v4.0 – v4.5.2:** Hoàn thiện giải đố 3 tầng, PBR Sobel Normal Map, xóa bỏ 100% ma 2D/SVG sang 6 nhóm NPC Ma 3D.
- **v5.0 – v5.1:** Hoàn thiện Rigging 15 khớp, 16 clips, AI Level 3, 8 kiểu Physical Jumpscare A–H, GLB Character Pipeline & Validator v5.1, cấu hình `vercel.json`.
- **v6.0 (Hiện tại):** Cốt truyện mới 100% **Hồ Sơ Đồi Sương Lâm Viên (1994–2004)**, mở rộng cả 5 map lên **`56×56m – 64×64m`**, thêm **Chứng cứ Ngụy tạo (Red Herrings)**, **4 Phòng Mật & Kết Cục Bí Mật Thứ 4**, **Điểm Ẩn Nấp `[E]`**, **Nhang Trầm `[Q]`**, và **Bản Đồ Hiện Trường + Minimap `[M]`**.

---

## 10. CÁC HẠNG MỤC CÒN THIẾU (BLOCKED) & HƯỚNG DẪN TÍCH HỢP ASSET BLENDER / AUDIO

1. **File model nhân vật & đạo cụ `.glb` xuất từ Blender (`public/models/`) — `BLOCKED` (chưa có file nhị phân ngoài):** Hệ thống `GLBNPCModel.tsx`, `NPCModelValidator.ts` và `ModelSlot.tsx` đã sẵn sàng tự động nạp ngay khi đặt file `.glb` theo chuẩn `docs/BLENDER_CHARACTER_SPEC_v5.1.md`.
2. **File âm thanh thu âm thực tế / Lồng tiếng Việt (`.ogg` / `.mp3` trong `public/audio/`) — `PARTIAL`:** Engine Web Audio HRTF hiện tổng hợp đầy đủ 100% âm thanh thời gian thực và đã có sẵn lớp `playBufferedSpatialSound()` để phát file thu âm thật ngay khi bổ sung asset.
