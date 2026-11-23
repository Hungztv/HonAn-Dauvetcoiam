# BÁO CÁO TỔNG THỂ TOÀN DIỆN DỰ ÁN — HỒN ÁN: DẤU VẾT CÕI ÂM (v5.0)

> **Thể loại:** Webgame 3D Kinh Dị Tâm Lý – Điều Tra Án Mạng Dân Gian Việt Nam (Góc nhìn thứ nhất / First-Person)  
> **Phiên bản hiện tại:** `v5.0` (Full 3D NPC Horror, Rigging, Animation, Level 3 AI & Physical Jumpscare System)  
> **Chuẩn cốt truyện:** Narrative Design Bible `v3.0` & Narrative Data Pack `v3.1`  
> **Chuẩn lưu dữ liệu:** Save Schema `v4` (`localStorage` key: `hon_an_save_v4`)  
> **Kho lưu trữ GitHub:** [https://github.com/Hungztv/HonAn-Dauvetcoiam.git](https://github.com/Hungztv/HonAn-Dauvetcoiam.git) (nhánh `main`)  
> **Quy mô mã nguồn thực tế:** **55 tệp trong `src/` (~15.683 dòng TypeScript/TSX/CSS)** + 9 tệp cấu hình & báo cáo ở thư mục gốc.  
> **Trạng thái kiểm thử:** **29/29 Vitest tests PASS**, **`tsc -b && vite build` PASS (0 lỗi)**, **Live Browser QA PASS (0 console/page error, ~214 FPS ở preset HIGH)**.

---

## MỤC LỤC

1. [Tổng Quan Dự Án & Công Nghệ](#1-tổng-quan-dự-án--công-nghệ)
2. [Toàn Bộ Cấu Trúc Thư Mục & Giải Thích Từng Tệp (64 Tệp)](#2-toàn-bộ-cấu-trúc-thư-mục--giải-thích-từng-tệp-64-tệp)
3. [Chi Tiết Cốt Truyện Đầy Đủ (Narrative Pack v3.1)](#3-chi-tiết-cốt-truyện-đầy-đủ-narrative-pack-v31)
4. [Hồ Sơ Chi Tiết Toàn Bộ 5 Màn Chơi (`level1.ts` → `level5.ts`)](#4-hồ-sơ-chi-tiết-toàn-bộ-5-màn-chơi-level1ts--level5ts)
5. [Hệ Thống NPC Ma 3D, Rigging, Animation, AI & Physical Jumpscare (v5.0)](#5-hệ-thống-npc-ma-3d-rigging-animation-ai--physical-jumpscare-v50)
6. [Hệ Thống Đồ Họa 3D PBR, Asset Pipeline & Post-Processing (v4.5.1)](#6-hệ-thống-đồ-họa-3d-pbr-asset-pipeline--post-processing-v451)
7. [Hệ Thống Âm Thanh 3D Web Audio HRTF](#7-hệ-thống-âm-thanh-3d-web-audio-hrtf)
8. [Quản Lý Trạng Thái (Zustand), Save Schema v4, UI/UX & Phím Tắt](#8-quản-lý-trạng-thái-zustand-save-schema-v4-uiux--phím-tắt)
9. [Kết Quả Kiểm Thử QA, Hiệu Năng & Lịch Sử Phiên Bản](#9-kết-quả-kiểm-thử-qa-hiệu-năng--lịch-sử-phiên-bản)
10. [Các Hạng Mục Còn Thiếu (BLOCKED) & Hướng Dẫn Tích Hợp Asset Blender / Audio](#10-các-hạng-mục-còn-thiếu-blocked--hướng-dẫn-tích-hợp-asset-blender--audio)

---

## 1. TỔNG QUAN DỰ ÁN & CÔNG NGHỆ

### 1.1. Tầm nhìn & Định hướng
**HỒN ÁN – DẤU VẾT CÕI ÂM** đưa người chơi vào vai một người trẻ vừa bước qua tuổi 20, trở về ngôi làng quê Đông Mộ đúng đêm **Rằm tháng Bảy âm lịch (05/09/1998)** để lần theo 4 vụ án bị che giấu theo chu kỳ 10 năm (**1958 → 1968 → 1978 → 1988 → 1998**).

Trò chơi kết hợp 4 trụ cột gameplay:
1. **Khám phá 3D góc nhìn thứ nhất** trong không gian làng quê Việt Nam (nhà gỗ ba gian, miếu cổ rừng tre, làng giếng cũ, đình làng gỗ lim, bến đò mù sương).
2. **Soi vật chứng 3D xoay 360°** tìm các điểm tương tác ẩn (hotspot mặt sau, đáy bát hương, cán dùi trống, vết sứt xu...).
3. **Điều tra logic 3 tầng (Tier 1–2–3)** kết hợp **Sổ Điều Tra 5 tab** và **Bảng Kết Nối Chỉ Đỏ** để suy luận mật mã/nghi thức và mở khóa **4 Chân Lý Cốt Lõi**.
4. **Kinh dị tâm lý & 6 nhóm NPC Ma 3D toàn thân** có AI nhận thức (FOV, LOS xuyên tường/cửa, phản ứng đèn pin), rình rập theo waypoint và **Physical 3D Jumpscare** trực tiếp trong không gian 3D (loại bỏ 100% ảnh ma 2D/SVG).

### 1.2. Công nghệ & Phiên bản thực tế (`package.json`)

| Nhóm | Thư viện / Công cụ | Phiên bản | Vai trò |
| :--- | :--- | :--- | :--- |
| Core UI | `react`, `react-dom` | `^18.3.1` | Giao diện HUD, Modal, Menu, Sổ Điều Tra |
| Language | `typescript` | `^5.6.3` | Kiểu dữ liệu chặt chẽ toàn bộ dự án |
| Build Tool | `vite`, `@tailwindcss/vite` | `^6.2.0` / `^4.0.14` | Dev server HMR, code-splitting production bundle |
| 3D Engine | `three` | `^0.169.0` | WebGL rendering, PBR materials, Skeleton/SkinnedMesh |
| React 3D | `@react-three/fiber`, `@react-three/drei` | `^8.17.10` / `^9.117.3` | Khai báo scene 3D, camera, lighting, R3F hooks |
| Post-FX | `@react-three/postprocessing`, `postprocessing` | `^2.16.3` / `^6.36.4` | Bloom tiết chế, Vignette, Noise film grain, ChromaticAberration |
| State | `zustand` | `^5.0.2` | Single source of truth, Save Schema v4, Narrative State |
| Animation UI | `framer-motion` | `^11.15.0` | Hiệu ứng chuyển màn, mở sổ, mở modal, toast |
| Icons | `lucide-react` | `^0.468.0` | Hệ thống biểu tượng UI sắc nét |
| Styling | `tailwindcss` | `^4.0.14` | Utility CSS v4 + font tiếng Việt cổ điển |
| Testing | `vitest` | `^2.1.8` | 29 bài unit/integration tests tự động |

**Lệnh chạy trong `package.json`:**
- `npm run dev` (trên Windows PowerShell dùng `npm.cmd run dev`): Khởi chạy Vite dev server (mặc định `http://localhost:5173/`).
- `npm run build` (`tsc -b && vite build`): Kiểm tra kiểu TypeScript nghiêm ngặt & đóng gói production vào `dist/` (chia 5 chunk: `vendor-three`, `vendor-r3f`, `vendor-postfx`, `vendor-ui`, `index`).
- `npm run preview`: Xem thử bản build production.
- `npm run test` (`vitest run`): Chạy toàn bộ 3 bộ test tự động.

---

## 2. TOÀN BỘ CẤU TRÚC THƯ MỤC & GIẢI THÍCH TỪNG TỆP (64 TỆP)

### 2.1. Cây thư mục đầy đủ (không tính `node_modules/`, `dist/`, `.git/`)

```text
hon-an/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── project-report.html                 # Báo cáo tiến độ HTML tương tác (v5.0)
├── PROJECT_FULL_REPORT.md              # Tài liệu báo cáo tổng thể toàn diện này
├── README.md
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── vite.config.ts
└── src/                                # 55 tệp mã nguồn (~15.683 dòng)
    ├── App.tsx                         # Điều phối màn hình, Canvas 3D, HUD, Modals & NPCDebugPanel
    ├── index.css                       # Tailwind v4 & CSS chủ đề kinh dị dân gian
    ├── main.tsx                        # Entry point React DOM
    ├── __tests__/                      # Bộ kiểm thử tự động Vitest (3 tệp, 613 dòng)
    │   ├── levelsAndPuzzles.test.ts    # Kiểm tra toàn vẹn 5 màn, mật mã, hotspots, vật chứng
    │   ├── narrativeAndSave.test.ts    # Kiểm tra Narrative v3.1, Spirit Score, 3 Ending, NG+, Save v4
    │   └── npcAndJumpscare.test.ts     # Kiểm tra 6 NPC 3D, FSM, LOS, Waypoint, GLB Validator, Scare A–H
    ├── audio/                          # Engine âm thanh 3D Web Audio HRTF (1 tệp, 789 dòng)
    │   └── horrorAudio.ts              # 5 theme nhạc nền, bước chân theo bề mặt, SFX không gian 3D cho 6 NPC
    ├── components/                     # Giao diện 2D / HUD / Modals (9 tệp, 2.456 dòng)
    │   ├── HUD.tsx                     # Tâm ngắm, pin đèn pin, mục tiêu, FPS/DC/Tri telemetry, toast
    │   ├── InspectModal.tsx            # Studio 3D xoay 360° soi vật chứng, zoom & 3D hotspots ẩn
    │   ├── InventoryModal.tsx          # Túi đồ vật chứng đã thu thập (phím I)
    │   ├── InvestigationJournal.tsx    # Sổ điều tra 5 tab + Bảng Kết Nối Chỉ Đỏ (phím Tab)
    │   ├── JumpscareOverlay.tsx        # Hiệu ứng phụ 2D khi jumpscare (vignette/chromatic/caption — 0% ma 2D)
    │   ├── MainMenu.tsx                # Menu chính, Chọn 5 chương, Cài đặt đồ họa/âm thanh, NG+
    │   ├── PauseMenu.tsx               # Menu tạm dừng, cài đặt nhanh, lưu & về menu (phím ESC)
    │   ├── PuzzleModal.tsx             # 3 cơ chế giải đố (Code Lock, Sequence, Deduction + Moral Choice) & 3 tầng gợi ý
    │   └── StoryScreens.tsx            # Intro từng chương, Hoàn thành màn, Màn hình 3 Kết Cục + NG+
    ├── data/                           # Toàn bộ dữ liệu cốt truyện & 5 màn chơi (7 tệp, 2.730 dòng)
    │   ├── narrativePack.ts            # Kinh thánh cốt truyện v3.1: Timeline, Core Truths, Moral Choices, Endings, NG+
    │   └── levels/
    │       ├── index.ts                # Export mảng LEVELS (5 màn) & hàm getLevelById()
    │       ├── level1.ts               # Án 01 (1988 – Đông): Ngôi Nhà Không Có Người Sống
    │       ├── level2.ts               # Án 02 (1968 – Nam): Miếu Cô Gái Áo Đỏ
    │       ├── level3.ts               # Án 03 (1978 – Tây): Tiếng Gõ Từ Đáy Giếng
    │       ├── level4.ts               # Án 04 (1958 – Bắc): Ngôi Đình Lúc Nửa Đêm
    │       └── level5.ts               # Án 05 (1998 – Bến Đò): Chuyến Đò Sang Cõi Âm
    ├── horror/                         # Toàn bộ hệ thống 3D NPC Ma, AI & Physical Jumpscare v5.0 (21 tệp, 3.589 dòng)
    │   ├── characters/                 # 6 mô hình nhân vật Ma 3D toàn thân có khớp nối (846 dòng)
    │   │   ├── ChildSpiritCharacter.tsx        # NPC 03: Hồn Đứa Trẻ Dưới Giếng (0.96m, nổi/chìm mặt nước)
    │   │   ├── FacelessPassengerCharacter.tsx  # NPC 05: 4 Hành Khách Không Khuôn Mặt (4 bộ trang phục, ngồi -> đứng)
    │   │   ├── FerrymanCharacter.tsx           # NPC 06: Người Lái Đò Nguyễn Văn Khải (nón lá rách, mái chèo)
    │   │   ├── LienCharacter.tsx               # NPC 02: Trần Thị Liên (15 khớp, Crawling, ShieldFace, khập khiễng)
    │   │   ├── MayCharacter.tsx                # NPC 01 (Ưu tiên #1): Đào Thị Mây (15 khớp, áo dài đỏ, tóc xõa che mặt)
    │   │   └── WoodenStatueCharacter.tsx       # NPC 04: 4 Tượng Quan Gỗ Đình Làng (Weeping-Angel đóng băng khi nhìn)
    │   ├── debug/                      # Công cụ kiểm thử NPC chỉ bật trong DEV / ?debug=1 (387 dòng)
    │   │   ├── npcDebugBus.ts          # Bus telemetry không gây re-render trong gameplay thường
    │   │   └── NPCDebugPanel.tsx       # Bảng Debug phím F9: theo dõi FOV/LOS/Flash, ép Jumpscare & Clip
    │   ├── jumpscare/                  # Hệ thống Physical 3D Jumpscare (338 dòng)
    │   │   ├── JumpscareAudio.ts       # Bộ định tuyến âm thanh 3D chuyên biệt theo từng loại NPC
    │   │   ├── JumpscareTriggers.ts    # 11 vùng kích hoạt Jumpscare qua 5 màn (có điều kiện Moral Choice)
    │   │   └── PhysicalJumpscareDirector.ts # Bộ lập kế hoạch 8 kiểu Jumpscare (A–H) & 6 pha hoạt động
    │   └── npc/                        # Lõi AI, Animation, Perception, Navigation & Pooling (2.018 dòng)
    │       ├── NPCAnimationController.ts # 16 Animation Clips, 15 khớp nối & RiggedGLBAnimator (SkeletonUtils)
    │       ├── NPCBehaviorDirector.tsx # Bộ điều phối AI Level 3 + Render World NPCs & Physical Jumpscare Actor
    │       ├── NPCController.tsx       # Switcher gắn nhân vật 3D theo NPCCharacterType & overrideClip
    │       ├── NPCModelValidator.ts    # Kiểm định 15 xương humanoid & animation clips cho file .glb ngoài
    │       ├── NPCNavigation.ts        # Waypoints rình rập 5 màn, tránh tường/cửa đóng, chọn điểm khuất tầm nhìn
    │       ├── NPCPerception.ts        # Ray-march LOS (0.15m), FOV cone, vùng đèn pin, độ ồn người chơi
    │       ├── NPCPooling.ts           # Quản lý vòng đời & giải phóng NPC khi chuyển màn
    │       ├── NPCRegistry.ts          # Định nghĩa thông số 6 NPC & danh sách spawn động theo Moral Choice / NG+
    │       ├── NPCSpawnManager.ts      # Kiểm tra va chạm tường/cửa đóng để không bao giờ spawn kẹt tường
    │       └── NPCStateMachine.ts      # Máy trạng thái 13 trạng thái (Dormant -> Jumpscaring -> Cooldown)
    ├── store/                          # Quản lý trạng thái toàn cục (1 tệp, 990 dòng)
    │   └── gameStore.ts                # Zustand store, Save Schema v4, Migration/Sanitizer, Actions
    ├── three/                          # Toàn bộ Engine 3D, PBR, Môi trường & Điều khiển (11 tệp, 3.976 dòng)
    │   ├── AssetPipeline.ts            # GLTFLoader + Draco + KTX2 + ModelCache + LOD + QUALITY_PROFILES
    │   ├── AtmosphericEffects.tsx      # Sương mù nhiều lớp, mưa phùn, bụi sáng, ánh trăng volumetric
    │   ├── EvidenceModels.tsx          # 17 mẫu mô hình 3D vật chứng chi tiết + hotspot markers
    │   ├── FirstPersonController.tsx   # Điều khiển FPS (WASD/Mouse/PointerLock+Drag), đèn pin, FOV recoil
    │   ├── HorrorPostProcessing.tsx    # EffectComposer: Bloom tiết chế, Vignette, Noise, ChromaticAberration
    │   ├── Level1Benchmark.tsx         # Cụm kiến trúc chuẩn mực Nhà Gỗ Ba Gian Màn 1 (cột lim, vì kèo, bàn thờ, giếng)
    │   ├── LevelEnvironment.tsx        # Dựng thế giới 3D cho cả 5 màn, cửa mở/đóng, đèn dầu, đo FPS/DC/Tri
    │   ├── ModelSlot.tsx               # Wrapper tự thay mesh procedural bằng file .glb nếu có trong MODEL_REGISTRY
    │   ├── proceduralTextures.ts       # Engine sinh texture PBR 512px: Albedo + Sobel RGB Normal + Roughness + Cookie
    │   ├── VietnameseProps.tsx         # Đạo cụ dân gian Việt Nam (bát hương, lư đồng, đèn lồng, tre, thuyền, bùa...)
    │   └── VisualStandard.ts           # Chuẩn hình ảnh thống nhất v4.5.1 (tỷ lệ, ánh sáng, hậu kỳ, hồ sơ 5 màn)
    └── types/                          # Định nghĩa kiểu TypeScript dùng chung (1 tệp, 316 dòng)
        └── game.ts                     # LevelData, EvidenceItem, ClueItem, Puzzle types, GameSettings, PerfStats
```

### 2.2. Bảng thống kê kích thước từng phân hệ trong `src/`

| Phân hệ | Số tệp | Số dòng code | Tỷ trọng |
| :--- | :---: | :---: | :---: |
| `src/three/` (3D Engine, PBR, Environment, FPS) | 11 | 3.976 | 25,4% |
| `src/horror/` (6 NPC 3D, AI, Jumpscare, Debug) | 21 | 3.589 | 22,9% |
| `src/data/` (Narrative Pack v3.1 & 5 Màn chơi) | 7 | 2.730 | 17,4% |
| `src/components/` (HUD, Journal, Inspect, Puzzle, UI) | 9 | 2.456 | 15,7% |
| `src/store/` (Zustand + Save Schema v4) | 1 | 990 | 6,3% |
| `src/audio/` (Web Audio 3D HRTF Engine) | 1 | 789 | 5,0% |
| `src/__tests__/` (Vitest Automated Tests) | 3 | 613 | 3,9% |
| `src/types/` (TypeScript Domain Models) | 1 | 316 | 2,0% |
| `src/App.tsx`, `main.tsx`, `index.css` | 3 | 224 | 1,4% |
| **TỔNG CỘNG (`src/`)** | **55** | **15.683** | **100%** |

---

## 3. CHI TIẾT CỐT TRUYỆN ĐẦY ĐỦ (NARRATIVE PACK v3.1)

Nguồn chân lý duy nhất của cốt truyện nằm tại `src/data/narrativePack.ts` (`NARRATIVE_VERSION = '3.1'`).

### 3.1. Bối cảnh tổng thể & Dòng thời gian chuẩn 40 năm (1958 – 1998)

Suốt 40 năm, tại làng **Đông Mộ**, thầy cúng **Năm Đen (Ngũ Hắc)** cùng hội đồng hương chức cũ đã lập ra một **tà trận chu kỳ 10 năm một lần**, khóa chặt bốn phương vị **Bắc – Nam – Tây – Đông** bằng 4 sinh mạng vô tội:

| Mốc thời gian | Phương vị | Nạn nhân | Tín vật | Biến cố lịch sử chính xác |
| :--- | :---: | :--- | :---: | :--- |
| **1958** | **Bắc** | **Ông Từ giữ đình** | **Dùi trống** | Năm Đen tráo giả Sắc Phong Thành Hoàng bằng ấn *Ngũ Hắc*, thủ tiêu Ông Từ giữ đình, yểm hồn vào đình và cất giấu chiếc dùi trống trong kho tế khí để cắt đứt chính khí bảo hộ của làng. |
| **1968** | **Nam** | **Đào Thị Mây** | **Trâm ngọc** | Đêm trước ngày cưới, cô gái trẻ Đào Thị Mây bị Năm Đen và Lý trưởng bắt làm vật **hiến sinh sống** chôn dưới nền Miếu Cô Đỏ để khóa mạch Hướng Nam, rồi dựng lời đồn ma tự vẫn để dọa dân làng suốt 30 năm. |
| **15/07/1978** *(Dương lịch)* | — | — | — | **Trần Thị Liên** & **Nguyễn Văn Khải** sinh hạ **cặp song sinh** (do Bà Đỡ Chín đỡ đẻ). |
| **18/08/1978** *(Rằm tháng Bảy ÂL — đúng 34 ngày sau)* | **Tây** | **Đứa trẻ song sinh** | **Đồng xu sứt** | Cặp song sinh bị ép mang ra giếng cổ Làng Bãi Vắng để hiến tế. Một đứa trẻ cùng chiếc đồng xu sứt bị thả xuống giếng trong chiếc giỏ tre. **Nguyễn Văn Khải** liều mạng đánh tráo giỏ tre, cứu đứa con còn lại — **chính là NHÂN VẬT CHÍNH (BẠN)** — gửi đi nơi khác nuôi lớn và dặn không được quay về trước tuổi 20. |
| **1988** | **Đông** | **Trần Thị Liên** | **Lược gỗ** | Quá đau đớn sau cái chết của con năm 1978, Trần Thị Liên bị tà khí giếng cổ xâm nhập. Để ngăn lời nguyền lan ra và bảo vệ đứa con đang sống xa nhà, Nguyễn Văn Khải buộc phải **niêm phong vợ trong Buồng Đông** nhà họ Nguyễn. Trước khi biệt tích, ông đột nhập kho tế khí đình cứu chiếc **Dùi trống 1958** khỏi bị đốt và giấu sau **Mảnh phù điêu đá** suốt 10 năm, rồi tự nguyện thế thân làm **Người Lái Đò** giữ Bến Đò Âm suốt từ 1988 đến 1998. |
| **05/09/1998** *(Rằm tháng Bảy ÂL)* | **Bến Đò** | **Hội tụ 4 oan hồn** | **Cả 4 tín vật** | Bạn chính thức **vượt qua tuổi 20** (phá vỡ hạn kỳ 20 năm của lời nguyền 1978) và nhận thư gọi về làng Đông Mộ. Bạn đi ngược lại trình tự nghi thức **Thuận Dương Phá Âm**: **Đông (1988) → Nam (1968) → Tây (1978) → Bắc (1958) → Bến Đò (1998)** để hóa giải tà trận 40 năm và tuyên lời phán quyết cuối cùng cho người cha ruột Nguyễn Văn Khải. |

### 3.2. Nghi thức "Thuận Dương Phá Âm"
- **Thứ tự phương vị chuẩn:** `Đông → Nam → Tây → Bắc` (chiều mặt trời mọc, thuận chiều kim đồng hồ).
- **Thứ tự 4 tín vật tương ứng:** `Lược (1988) → Trâm (1968) → Xu (1978) → Trống (1958)`.
- Quy luật này nhất quán xuyên suốt từ lời gợi ý Màn 1, thứ tự đi qua 4 màn, câu đố đánh Trống Hội Màn 4, mật mã Hòm Sắt Người Lái Đò Màn 5, đến Nghi thức kết thúc.

### 3.3. Bốn Chân Lý Cốt Lõi (`CORE_TRUTH_IDS`)
Mỗi màn từ 1 đến 4 khi hoàn tất Tầng 3 sẽ mở khóa vĩnh viễn 1 Chân Lý Cốt Lõi:
1. `truth_l1_sealed_room` (**Màn 1 • 1988 – Đông • Lược gỗ**): *Căn Buồng Niêm Phong Năm 1988* — Khải phong ấn Trần Thị Liên (mẹ ruột cặp song sinh) để ngăn tà khí giếng cổ và bảo vệ đứa con còn sống.
2. `truth_l2_living_sacrifice` (**Màn 2 • 1968 – Nam • Trâm ngọc**): *Nghi Lễ Hiến Sinh Sống Năm 1968* — Đào Thị Mây không tự vẫn mà bị hiến sinh sống ngay đêm trước lễ cưới.
3. `truth_l3_twin_bloodline` (**Màn 3 • 1978 – Tây • Đồng xu sứt**): *Huyết Thống Cặp Song Sinh Năm 1978* — Sinh `15/07/1978`, 34 ngày sau (`18/08/1978`) một đứa bị hiến tế xuống giếng, Khải cứu đứa còn lại (chính là bạn).
4. `truth_l4_forged_edict` (**Màn 4 • 1958 – Bắc • Dùi trống**): *Sắc Phong Giả & Nỗi Oan Ông Từ Năm 1958* — Sắc phong Thành Hoàng bị tráo giả năm 1958, Ông Từ bị sát hại, dùi trống được Khải cứu năm 1988 giấu sau mảnh phù điêu suốt 10 năm.

### 3.4. Hệ thống 3 Lựa Chọn Đạo Đức & Chỉ số Chính Khí (`spiritScore`)

Mỗi lựa chọn sau khi chọn sẽ **khóa vĩnh viễn trong lượt chơi hiện tại** (`already_locked`), và điểm **Chính Khí (`spiritScore`)** luôn được tính lại nghiêm ngặt từ 3 lựa chọn hợp lệ (không thể gian lận qua localStorage):

| # | Mã lựa chọn (`choiceId`) | Xuất hiện ở | Các phương án (`value`) | Điểm Chính Khí | Tác động thực tế trong game |
| :-: | :--- | :---: | :--- | :---: | :--- |
| 1 | `fate_dao_thi_may` | **Màn 2 (Tầng 3)** | • `release` (*Giải thoát Đào Thị Mây*)<br>• `keep` (*Giữ lại oán hồn*) | **`+1`**<br>**`-1`** | • Nếu `release`: NPC Đào Thị Mây trở thành thân thiện (`isHostile: false`), tắt bẫy jumpscare thù địch ở Màn 2, tăng thiện cảm (hương sen làm rõ sổ khai sinh Màn 3).<br>• Nếu `keep`: Oán hồn Đào Thị Mây bám theo phục kích bằng Jumpscare 3D ở **Màn 4 (`npc_l4_may_ambush`)** và **Màn 5 (`npc_l5_may_ambush`)**, làm rỉ mực máu che sổ Màn 3. |
| 2 | `fate_village_truth` | **Màn 4 (Tầng 3)** | • `reveal` (*Công bố toàn bộ sự thật*)<br>• `burn` (*Thiêu hủy hồ sơ tội ác*) | **`+1`**<br>**`-1`** | • Nếu `reveal`: Sổ lái đò Màn 5 sáng rõ, Chính Khí tăng.<br>• Nếu `burn`: Mép sổ lái đò cháy sém đen ngòm, cường độ kinh dị (`horrorIntensity`) tăng thêm `+0.16` khi `spiritScore < 0`. |
| 3 | `judgment_nguyen_van_khai` | **Màn 5 (Tầng 3)** | • `forgive` (*Tha thứ cho người cha*)<br>• `condemn` (*Kết tội ông*) | **`0`**<br>**`0`** | Không cộng/trừ Chính Khí, nhưng trực tiếp phân nhánh giữa **Kết Cục Thật** (`forgive`) và **Kết Cục Ngậm Ngùi** (`condemn`). |

### 3.5. Hệ thống 3 Kết Cục (`resolveEnding`) & Mã lý do Kết Cục Bóng Tối

1. **KẾT CỤC THẬT — BÌNH MINH TRÊN BẾN ĐÒ ÂM (`true_ending`)**
   - **Điều kiện:** Đủ cả **4/4 Chân Lý Cốt Lõi** + **`spiritScore === +2`** (`release` + `reveal`) + **`judgment === 'forgive'`**.
   - **Nội dung:** Bốn tín vật Lược – Trâm – Xu – Trống đồng loạt tỏa sáng vàng. Bình minh ngày 05/09/1998 xua tan sương mù. Bốn oan hồn (Liên, Mây, người em song sinh, Ông Từ) siêu thoát. Nguyễn Văn Khải buông mái chèo, rơi nước mắt thanh thản khi nghe đứa con mình cứu sống gọi một tiếng *"Cha"*. Lời nguyền 40 năm khép lại.

2. **KẾT CỤC NGẬM NGÙI — ĐÒ RỜI BẾN VẮNG (`bittersweet_ending`)**
   - **Điều kiện:** Đủ cả **4/4 Chân Lý Cốt Lõi** + **`spiritScore === +2`** (`release` + `reveal`) + **`judgment === 'condemn'`**.
   - **Nội dung:** Mọi án oan suốt 40 năm được rửa sạch, cả 4 oan hồn đều được siêu thoát. Tuy nhiên trước lời kết tội lạnh lùng của bạn, Nguyễn Văn Khải không biện minh một lời — ông đội lại chiếc nón lá rách, một mình chèo con đò trống chìm dần vào sương trắng để tự gánh phần nghiệp cuối cùng.

3. **KẾT CỤC BÓNG TỐI — CHUYẾN ĐÒ KHÔNG BẾN (`dark_ending`)**
   - **Điều kiện:** Không thỏa 1 trong 2 kết cục trên. Hệ thống tự phân loại chính xác mã lỗi `darkReason`:
     - `incomplete_truth`: Thiếu ít nhất 1 trong 4 Chân Lý Cốt Lõi.
     - `compromised_conscience`: `spiritScore < 2` (chọn `keep` hoặc `burn`).
     - `judgment_missing`: Chưa tuyên phán quyết cuối cùng.
     - `multiple`: Vi phạm đồng thời từ 2 điều kiện trở lên.
   - **Nội dung:** Nghi thức Thuận Dương Phá Âm gãy đoạn, bốn ngọn đèn lồng trên đò phụt tắt. Tiếng trống đình và tiếng gõ đáy giếng vọng từ bốn phương, chiếc nón lá rách rơi xuống trước chân bạn — buộc bạn ở lại làm người lái đò mới đến đêm Rằm tháng Bảy tiếp theo.

### 3.6. Cơ chế New Game+ (NG+) & Bí mật ẩn
Hoàn thành bất kỳ kết cục nào sẽ mở khóa vĩnh viễn **`ngPlusUnlocked = true`** và ghi nhận vào `completedEndings[]`. Khi bắt đầu lượt chơi **New Game+**:
- Reset tiến độ điều tra, `coreTruths`, `moralChoices`, `spiritScore` về 0 cho lượt chơi mới, nhưng giữ lại `completedEndings`, mở `isNewGamePlus = true`, tăng `ngPlusRunCount`, tăng nền kinh dị `+0.08`.
- **Xuất hiện NPC ẩn từ Màn 1:** `npc_l1_ngp_ferryman` (bóng Người Lái Đò Nguyễn Văn Khải đội nón lá rách đứng lặng lẽ bên góc sân `[4.4, 0, 8.4]` nhìn bạn từ rất sớm — nhẹ nhàng biến mất nếu bạn lại gần soi đèn pin).
- **4 Ghi chú vật chứng bí mật chỉ xuất hiện trong NG+:**
  1. `l1_incense_bowl` (*Bát hương bị nứt*): Dòng chữ khắc mờ trên thân đèn pin của Khải: *"Con phải sống qua tuổi 20 — đừng quay về trước Rằm tháng Bảy 1998"*.
  2. `l1_ritual_paper` (*Tờ giấy cúng*): Lá đơn đỏ gấp nhỏ nhắc mốc sinh `15/07/1978` và cơ hội duy nhất đêm `05/09/1998`.
  3. `l4_mallet` (*Dùi trống hội*): Khắc mặt trong cán dùi giải thích Khải giấu dùi trống sau phù điêu 10 năm (1988–1998).
  4. `l5_letter` (*Thư Nguyễn Văn Khải*): Dòng tái bút: *"Cha đã đứng đợi trên bến đò từ khi con còn đặt chân vào nhà gỗ ba gian. Tha thứ hay phán xét — cha đều chấp nhận."*

---

## 4. HỒ SƠ CHI TIẾT TOÀN BỘ 5 MÀN CHƠI (`level1.ts` → `level5.ts`)

### MÀN 1 — `ÁN 01 • 1988 – ĐÔNG`: Ngôi Nhà Không Có Người Sống
- **File:** `src/data/levels/level1.ts` | **Theme âm thanh:** `house` | **Spawn:** `[0, 1.65, 2.9]` | **Bounds:** `X[-10.5, 10.5], Z[-7.5, 10.5]`
- **Bối cảnh:** Nhà gỗ ba gian họ Nguyễn (Gian giữa bàn thờ gia tiên, Gian Tây buồng ngủ & bếp, Gian Đông Buồng Niêm Phong dán bùa vàng từ 1988, sân sau có giếng đá cổ). Có cụm kiến trúc chuẩn mực `Level1Benchmark.tsx` (cột lim chân tảng đá, hệ vì kèo xà ngang, bàn thờ sơn son thếp vàng, đèn dầu thủy tinh, giếng đá cổ có ròng rọc).
- **Vật chứng 3D (5 vật phẩm, 9 hotspots ẩn):**
  1. `l1_incense_bowl` (*Bát hương bị nứt* — `incense_bowl` tại `[0, 1.24, -5.65]`): Vết nứt sáp đỏ (`l1_c1`) + **lật đáy zoom** thấy số **`15`** (`l1_c2`).
  2. `l1_comb` (*Chiếc lược gỗ dính tóc — Tín vật Đông 1988* — `comb` tại `[-5.4, 0.88, -3.5]`): Lọn tóc bùn giếng (`l1_c3`) + sống lược khắc *"Trần Thị Liên — 1988 — Hướng Đông"* (`l1_c4`).
  3. `l1_ritual_paper` (*Tờ giấy cúng mực đỏ* — `ritual_paper` tại `[0.85, 1.02, 7.6]` cạnh giếng): Khoanh đỏ **tháng `07`** của `15/07/1978` (`l1_c5`) + góc giấy cháy ghi thứ tự Đông → Nam (`l1_c6`).
  4. `l1_torn_photo` (*Bức ảnh gia đình bị xé* — `torn_photo` tại `[6.2, 1.12, -2.2]`, Tầng 3): Mặt trước vết xé Trần Thị Liên (`l1_c7`) + **mặt sau zoom** chỉ dẫn tới Miếu Cô Gái Áo Đỏ (`l1_c8`).
  5. `l1_diary` (*Cuốn sổ của Nguyễn Văn Khải* — `diary` tại `[5.4, 0.96, -4.9]`, Tầng 3): Nhật ký 1988 giải thích lý do Khải niêm phong Buồng Đông (`l1_c7`).
- **Bảng Kết Nối Chỉ Đỏ (2 cặp):**
  - `l1_conn_1` (**Bắt buộc mở Tầng 2**): `l1_c2` (*Số "15"*) + `l1_c5` (*Tháng "07"*) → Mật mã bàn thờ **`1507`**.
  - `l1_conn_2`: `l1_c3` + `l1_c4` → Xác nhận chủ nhân chiếc lược là Trần Thị Liên.
- **Giải đố 3 tầng:**
  - **Tầng 1:** Thu thập tối thiểu 4 manh mối.
  - **Tầng 2 (`l1_altar_lock` — `code_lock`):** Khóa Phong Ấn Bàn Thờ → Lời giải: **`1 - 5 - 0 - 7`** → Mở khóa cửa niêm phong `door_l1_sealed` (`[3.2, 1.35, 0.5]`).
  - **Tầng 3 (`l1_truth_deduction` — `deduction`):** 3 câu hỏi suy luận tại Hòm Chứng Từ (`[6.8, 1.12, -4.8]`) → Mở khóa `truth_l1_sealed_room`.
- **Nghi phạm:** Nguyễn Văn Khải, Trần Thị Liên.

---

### MÀN 2 — `ÁN 02 • 1968 – NAM`: Miếu Cô Gái Áo Đỏ
- **File:** `src/data/levels/level2.ts` | **Theme âm thanh:** `shrine` | **Spawn:** `[0, 1.65, 8.8]` | **Bounds:** `X[-11.5, 11.5], Z[-10.8, 10.8]`
- **Bối cảnh:** Con đường đá xuyên rừng tre âm u, gốc cây đa cổ phía Tây, Tiền điện miếu treo đèn lồng đỏ rực và Hậu Cung bị khóa bùa yểm.
- **Vật chứng 3D (4 vật phẩm, 7 hotspots ẩn):**
  1. `l2_hairpin` (*Chiếc trâm ngọc — Tín vật Nam 1968* — `hairpin` tại `[-5.6, 0.42, 2.8]`): Hoa sen ngọc khắc *"Đào Thị Mây — 1968 — Hướng Nam"* (`l2_c1`) + mũi trâm cong vì giằng co (`l2_c2`).
  2. `l2_talisman` (*Lá bùa trấn yểm* — `talisman` tại `[-2.1, 1.35, -1.7]`): Ấn son *Ngũ Hắc* (`l2_c3`) + **mặt sau zoom** ghi Bước I & II nghi thức (`l2_c4`).
  3. `l2_paper_doll` (*Búp bê giấy áo đỏ* — `paper_doll` tại `[3.2, 0.55, -3.5]`): Kim ghim ngực cuộn giấy ghi Bước III & IV (`l2_c5`).
  4. `l2_tablet` (*Bài vị gỗ bị chém nứt* — `ancestral_tablet` tại `[-1.4, 1.15, -8.5]`, Tầng 3): Mặt trước lộ chữ *"Hiến sinh sống Đào Thị Mây — 1968"* (`l2_c6`) + **mặt sau zoom** chỉ hướng Tây Làng Giếng Cũ 1978 (`l2_c7`).
- **Bảng Kết Nối Chỉ Đỏ (2 cặp):**
  - `l2_conn_1` (**Bắt buộc mở Tầng 2**): `l2_c4` (Bước I–II) + `l2_c5` (Bước III–IV) → Phục hồi 4 bước lễ giải oan.
  - `l2_conn_2`: `l2_c1` + `l2_c2` → Chứng minh bị bắt hiến sinh sống chứ không tự vẫn.
- **Giải đố 3 tầng:**
  - **Tầng 1:** Thu thập tối thiểu 4 manh mối.
  - **Tầng 2 (`l2_ritual_sequence` — `sequence`):** Bệ Nghi Thức Câu Đối Cổ → Lời giải: **`I. Rưới Nước Thanh Tẩy → II. Thắp Hương Dẫn Hồn → III. Đặt Trâm Nhận Danh → IV. Gõ Chuông Giải Oan`** (`step_tay → step_hon → step_danh → step_oan`) → Mở cửa Hậu Cung `door_l2_inner`.
  - **Tầng 3 (`l2_truth_deduction` — `deduction` + Lựa chọn Đạo đức I):** 3 câu hỏi + chọn `fate_dao_thi_may` (`release` +1 / `keep` -1) → Mở khóa `truth_l2_living_sacrifice`.
- **Nghi phạm:** Đào Thị Mây, Thầy Cúng Năm Đen (Ngũ Hắc).

---

### MÀN 3 — `ÁN 03 • 1978 – TÂY`: Tiếng Gõ Từ Đáy Giếng
- **File:** `src/data/levels/level3.ts` | **Theme âm thanh:** `village` | **Spawn:** `[0, 1.65, 9.8]` | **Bounds:** `X[-12.2, 12.2], Z[-12.0, 11.5]`
- **Bối cảnh:** Thôn Bãi Vắng dưới cơn mưa đêm, trung tâm là chiếc giếng đá cổ có trục tời xích sắt, bao quanh bởi Nhà Thầy Cúng (Tây), Nhà Bà Đỡ (Đông) và Nhà Trưởng Thôn bị khóa xích (Bắc).
- **Vật chứng 3D (5 vật phẩm, 6 hotspots ẩn):**
  1. `l3_knife` (*Con dao gỉ sét* — `rusted_knife` tại `[-8.2, 0.85, -1.6]`): Sợi dây gai khớp dây giếng (`l3_c1`) + cán gỗ khắc **`78`** (`l3_c2`).
  2. `l3_coin` (*Đồng xu sứt xâu chỉ đỏ — Tín vật Tây 1978* — `ancient_coin` tại `[-7.0, 0.72, 1.9]`): Vết sứt & khắc *"1978 — Hướng Tây — Xu"* (`l3_c3`).
  3. `l3_register` (*Hồ sơ khai sinh bị sửa* — `diary` tại `[8.2, 0.92, -0.8]`): Trang `15/07/1978` ghi đầu năm **`19..`** & cặp song sinh Khải – Liên, đêm `18/08/1978` sau 34 ngày (`l3_c4`).
  4. `l3_rope` (*Đoạn dây thừng & Dấu giỏ tre* — `rope` tại `[-1.15, 1.05, 0.4]`): Chứng minh chỉ thả 1 giỏ tre xuống giếng, giỏ kia được Khải bế trốn (`l3_c5`).
  5. `l3_confession` (*Sổ mật Nhà Trưởng Thôn* — `ledger` tại `[-1.4, 0.96, -8.8]`, Tầng 3): Xác nhận bạn là đứa trẻ sống sót năm 1978 & dẫn về Ngôi Đình Cổ năm 1958 (`l3_c6`).
- **Bảng Kết Nối Chỉ Đỏ (2 cặp):**
  - `l3_conn_1` (**Bắt buộc mở Tầng 2**): `l3_c2` (`78`) + `l3_c4` (`19..`) → Mật mã **`1978`**.
  - `l3_conn_2`: `l3_c3` + `l3_c5` → Bí mật cặp song sinh đêm `18/08/1978`.
- **Giải đố 3 tầng:**
  - **Tầng 1:** Thu thập tối thiểu 4 manh mối.
  - **Tầng 2 (`l3_well_winch` — `code_lock`):** Khóa Đồng Trục Tời Giếng → Lời giải: **`1 - 9 - 7 - 8`** → Mở cửa Nhà Trưởng Thôn `door_l3_headman`.
  - **Tầng 3 (`l3_truth_deduction` — `deduction`):** 3 câu hỏi xác nhận huyết thống cặp song sinh → Mở khóa `truth_l3_twin_bloodline`.
- **Nghi phạm:** Bà Đỡ Chín, Trưởng Thôn Bãi Vắng.

---

### MÀN 4 — `ÁN 04 • 1958 – BẮC`: Ngôi Đình Lúc Nửa Đêm
- **File:** `src/data/levels/level4.ts` | **Theme âm thanh:** `temple` | **Spawn:** `[0, 1.65, 8.2]` | **Bounds:** `X[-11.2, 11.2], Z[-11.4, 9.8]`
- **Bối cảnh:** Gian Đại Bái ngôi đình gỗ lim rộng lớn với 6 cột cái, 4 pho tượng quan gỗ tự di chuyển/xoay khi người chơi quay lưng, Trống Hội cổ, Án thờ trung tâm và Hậu Cung Đình phía Bắc.
- **Vật chứng 3D (5 vật phẩm, 6 hotspots ẩn):**
  1. `l4_decree` (*Sắc phong cổ bị tráo 1958* — `royal_decree` tại `[0, 1.15, -3.5]`): Ấn *Ngũ Hắc 1958* đè ấn triều đình (`l4_c1`) + mép lụa ghi 2 hồi trống đầu *Đông → Nam* (`l4_c2`).
  2. `l4_mallet` (*Dùi trống hội — Tín vật Bắc 1958* — `drum_mallet` tại `[6.4, 1.02, 0.9]`): **Mặt sau cán dùi zoom** ghi chuỗi *1958 kho tế khí → 1988 Khải giấu sau phù điêu* & 2 hồi cuối *Tây → Bắc* (`l4_c3`).
  3. `l4_relief` (*Mảnh phù điêu đá có hốc ẩn* — `relief_fragment` tại `[6.2, 0.75, 1.5]`): Hốc đá từng cất dùi trống 10 năm & tiết lộ Ông Từ bị yểm vào tượng gỗ (`l4_c4`).
  4. `l4_bell_plaque` (*Bài vị Văn Bia Chuông Đồng* — `ancestral_tablet` tại `[-5.8, 1.15, 1.2]`): **Mặt sau zoom** xác nhận đủ *Đông → Nam → Tây → Bắc (Lược → Trâm → Xu → Trống)* (`l4_c5`).
  5. `l4_pact_scroll` (*Bản Giao Ước Tà Trận 1958* — `ritual_paper` tại `[-1.4, 1.12, -9.2]`, Tầng 3): Danh sách đầy đủ 4 chu kỳ 10 năm & hẹn giờ phán quyết tại Bến Đò Âm `05/09/1998` (`l4_c6`).
- **Bảng Kết Nối Chỉ Đỏ (2 cặp):**
  - `l4_conn_1` (**Bắt buộc mở Tầng 2**): `l4_c2` (Đông → Nam) + `l4_c3` (Tây → Bắc) → Thứ tự 4 hồi trống.
  - `l4_conn_2`: `l4_c3` + `l4_c4` → Chuỗi hành trình chiếc dùi trống `1958 → 1988 → 1998`.
- **Giải đố 3 tầng:**
  - **Tầng 1:** Thu thập tối thiểu 4 manh mối.
  - **Tầng 2 (`l4_drum_sequence` — `sequence`):** Trống Hội Cổ → Lời giải: **`Hồi Đông (1988 • Lược) → Hồi Nam (1968 • Trâm) → Hồi Tây (1978 • Xu) → Hồi Bắc (1958 • Trống)`** (`drum_dong → drum_nam → drum_tay → drum_bac`) → Mở cửa Hậu Cung `door_l4_sanctum`.
  - **Tầng 3 (`l4_truth_deduction` — `deduction` + Lựa chọn Đạo đức II):** 3 câu hỏi + chọn `fate_village_truth` (`reveal` +1 / `burn` -1) → Mở khóa `truth_l4_forged_edict`.
- **Nghi phạm:** Ông Từ Giữ Đình (1958), Nguyễn Văn Khải (Hành động 1988).

---

### MÀN 5 — `ÁN 05 • 1998 – BẾN ĐÒ`: Chuyến Đò Sang Cõi Âm
- **File:** `src/data/levels/level5.ts` | **Theme âm thanh:** `river` | **Spawn:** `[0, 1.65, 8.2]` | **Bounds:** `X[-9.5, 9.5], Z[-11.6, 9.5]`
- **Bối cảnh:** Bờ sông mù sương dày đặc lúc canh năm `05/09/1998`, cầu gỗ nối ra con đò mái tre treo đèn lồng đỏ, 4 hành khách không khuôn mặt ngồi trên khoang đò (sẽ đồng loạt đứng dậy khi mở xích Tầng 3) và Người Lái Đò chèo mái chèo ở mũi đò.
- **Vật chứng 3D (5 vật phẩm, 6 hotspots ẩn):**
  1. `l5_ledger` (*Cuốn sổ ghi chép người lái đò* — `ledger` tại `[-1.4, 1.05, 2.2]`): Trang 1 ghi Đông (`Lược`) & Nam (`Trâm`) (`l5_c1`) + Trang 2 ghi Tây (`Xu`) & Bắc (`Trống`) (`l5_c2`).
  2. `l5_lantern` (*Đèn lồng giấy đỏ bến sông* — `lantern` tại `[-4.6, 1.12, 5.2]`): Vành tre khắc điều kiện cần đủ 4 Chân Lý & Chính Khí trong sạch (`l5_c3`).
  3. `l5_coins` (*Bốn đồng tiền âm dương* — `ancient_coin` tại `[4.5, 0.85, 5.0]`): Mặt sau có nét chữ Nguyễn Văn Khải tự thế thân giữ đò 10 năm (`l5_c4`).
  4. `l5_letter` (*Thư của Nguyễn Văn Khải 05/09/1998* — `ritual_paper` tại `[1.5, 1.02, 0.6]`): Lời thú nhận của người cha gọi con tròn 20 tuổi về phán quyết (`l5_c5`).
  5. `l5_token` (*Lệnh Bài Người Lái Đò* — `ancestral_tablet` tại `[-1.2, 0.96, -7.8]`, Tầng 3): Phù hiệu *"Nguyễn Văn Khải — Tự nguyện giữ bến đò 1988–1998"* (`l5_c6`).
- **Bảng Kết Nối Chỉ Đỏ (2 cặp):**
  - `l5_conn_1` (**Bắt buộc mở Tầng 2**): `l5_c1` + `l5_c2` → Thứ tự Hòm Sắt: **`Lược → Trâm → Xu → Trống`**.
  - `l5_conn_2`: `l5_c4` + `l5_c5` → Sự hy sinh suốt 20 năm của Nguyễn Văn Khải.
- **Giải đố 3 tầng:**
  - **Tầng 1:** Thu thập tối thiểu 4 manh mối.
  - **Tầng 2 (`l5_ferryman_chest` — `code_lock`):** Hòm Sắt Người Lái Đò → Lời giải: **`Lược — Trâm — Xu — Trống`** → Hạ xích sắt `door_l5_ferry_gate` cho phép bước lên boong đò.
  - **Tầng 3 (`l5_truth_deduction` — `deduction` + Lựa chọn Cuối cùng):** 3 câu hỏi tổng kết + chọn `judgment_nguyen_van_khai` (`forgive` / `condemn`) → Kích hoạt `completeGameWithEnding()` → Chuyển màn hình Kết Cục (`GrandEndingScreen`) & mở khóa New Game+.
- **Nghi phạm:** Nguyễn Văn Khải (Người Lái Đò), Bốn Hành Khách Không Khuôn Mặt.

---

## 5. HỆ THỐNG NPC MA 3D, RIGGING, ANIMATION, AI & PHYSICAL JUMPSCARE (v5.0)

### 5.1. Nguyên tắc bắt buộc đã thực thi
- **0% ảnh ma 2D / 0% SVG ma jumpscare:** Toàn bộ thực thể ma là mô hình 3D có hình thể hoàn chỉnh đặt trong thế giới Three.js.
- **Tự động hủy an toàn:** Khi mở Pause / Puzzle / Inspect / Journal, NPC tự ngắt `Jumpscaring → Retreating`, không bao giờ kẹt camera hay làm mất chuột.

### 5.2. Danh mục 6 nhóm NPC Ma 3D toàn thân (`NPCRegistry.ts` & `src/horror/characters/`)

| STT | Mã (`type`) | Nhân vật | Chiều cao | Bán kính | Khoảng cách an toàn | Xuất hiện ở | Đặc điểm hình thể & hành vi nổi bật |
| :-: | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| 1 | `dao_thi_may` *(Ưu tiên #1)* | **Đào Thị Mây** (Cô Gái Áo Đỏ) | `1.64m` | `0.34m` | `1.35m` | Màn 2 (2 NPC); Màn 4 & 5 nếu chọn `keep` | 15 khớp nối, áo dài đỏ thẫm rách có tà áo bay, tóc đen dài rũ che mặt, chân trần. Rình rập theo waypoint khuất tầm nhìn; đứng khựng + `SlowHeadRaise` khi bị nhìn; gặp ánh đèn pin sẽ `BackwardWalk` → tan biến & đổi vị trí nấp! Nếu `release` sẽ thành thân thiện. |
| 2 | `tran_thi_lien` | **Trần Thị Liên** (1988) | `1.62m` | `0.34m` | `1.30m` | Màn 1 (2 NPC) | 15 khớp nối, dáng đi khập khiễng (`LimpWalk`), tóc bết, ánh mắt hốc tối. Khi bị rọi đèn pin sẽ giơ cẳng tay che mặt (`ShieldFace`), hạ thân bò trên sàn (`Crawling` với `hipsY = 0.16`, `hipsXRot = 1.16`) và rút vào bóng tối. |
| 3 | `child_spirit` | **Hồn Đứa Trẻ Dưới Giếng** (1978) | `0.96m` | `0.26m` | `1.40m` | Màn 3 (Giếng cổ) | Hình bóng trẻ nhỏ ướt sũng (không bạo lực phản cảm), từ từ trồi lên khỏi mặt nước (`WaterRise`) khi người chơi tới gần trong 5.5m, xoay đầu nhìn rồi chìm xuống. |
| 4 | `wooden_statue` | **4 Tượng Quan Gỗ Đình Làng** (1958) | `2.05m` | `0.42m` | `1.75m` | Màn 4 (4 bản thể độc lập) | Tượng gỗ sơn son thếp vàng đội mũ cánh chuồn trên bệ gỗ. **AI Weeping-Angel (dùng LOS thật):** đóng băng cứng khi nằm trong FOV + không bị khuất tường; lén xoay mình và bước gần `0.72m` kèm tiếng gỗ nặng mỗi khi người chơi quay lưng! |
| 5 | `faceless_passenger` | **4 Hành Khách Không Khuôn Mặt** | `1.68m` | `0.34m` | `1.45m` | Màn 5 (4 biến thể trang phục) | 4 biến thể đúng 4 nạn nhân (Liên, Mây, Song sinh cao 0.72x, Ông Từ đội nón). Mặt trắng trơn không ngũ quan. Ban đầu ngồi im (`SittingIdle`), lần lượt quay đầu theo số manh mối tìm được, và **cả 4 đồng loạt đứng dậy (`StandUp`)** khi mở xích đò Tầng 3! |
| 6 | `ferryman` | **Người Lái Đò (Nguyễn Văn Khải)** | `1.70m` | `0.36m` | `1.65m` | Màn 5 (mũi đò); Màn 1 (chỉ NG+) | Ông lão gầy mặc áo nâu sẫm, đội nón lá rách che mặt, cầm mái chèo gỗ chuyển động chèo (`Rowing`). Ở NG+ Màn 1 xuất hiện sớm ở sân sau và tan biến nhẹ nếu bị chiếu đèn gần. |

### 5.3. Chuẩn Rigging 15 xương & 16 Animation Clips (`NPCModelValidator.ts` & `NPCAnimationController.ts`)
- **15 xương bắt buộc (`REQUIRED_HUMANOID_BONES`):** `Hips`, `Spine`, `Chest`, `Neck`, `Head`, `LeftArm`, `RightArm`, `LeftForeArm`, `RightForeArm`, `LeftHand`, `RightHand`, `LeftLeg`, `RightLeg`, `LeftFoot`, `RightFoot`.
- **16 Animation Clips (`NPCAnimationClipName`):** `Idle`, `HeadTilt`, `SlowHeadRaise`, `SlowWalk`, `BackwardWalk`, `LimpWalk`, `Crawling`, `ShieldFace`, `ReachForward`, `Lunge`, `JumpscareAttack`, `SittingIdle`, `StandUp`, `Rowing`, `WaterRise`, `Disappear`.
- **Hỗ trợ GLB ngoài:** `RiggedGLBAnimator` dùng `SkeletonUtils.clone` (độc lập skeleton cho nhiều instance như 4 tượng gỗ / 4 hành khách), `AnimationMixer`, `crossfadeTo()`, và tự kiểm tra độ hợp lệ qua `validateNPCModel()`.

### 5.4. AI Level 3: FSM 13 trạng thái, Perception & Waypoint Navigation
- **13 trạng thái FSM (`NPCStateMachine.ts`):** `Dormant`, `Hidden`, `Idle`, `Observing`, `Stalking`, `Approaching`, `Chasing`, `Attacking`, `Jumpscaring`, `Retreating`, `Disappearing`, `Cooldown`, `Disabled`.
- **Perception (`NPCPerception.ts`):**
  - Khoảng cách XZ, góc nhìn FOV (`dot >= 0.56`).
  - **Ray-march Line-of-Sight bước `0.15m`** kiểm tra chính xác cả tường cao (`top >= 1.35m`) lẫn **cánh cửa mỏng đang đóng** (mở cửa ra là có LOS ngay).
  - Phát hiện chùm đèn pin (`flashlightOn && distance <= 16 && dot >= 0.86 && hasLineOfSight`).
  - Mức độ ồn người chơi (`sprinting: 1.0`, `walking: 0.55`, `crouching: 0.20`).
  - **Tối ưu FPS theo khoảng cách:** `<10m` cập nhật mỗi frame, `10–20m` mỗi `0.08s`, `>20m` mỗi `0.25s`, `>26m` culling tạm dừng animation.
- **Navigation (`NPCNavigation.ts`):**
  - Mạng lưới `LEVEL_STALK_WAYPOINTS` riêng cho cả 5 màn (Màn 1: 7 điểm, Màn 2: 10 điểm, Màn 3: 4 điểm, Màn 4: 7 điểm, Màn 5: 5 điểm).
  - `computeSafeStepToward()`: Thử hướng thẳng rồi xoay tránh `±30° / ±60°` để trượt quanh cột và cửa đóng mà không kẹt tường.
  - `pickUnseenStalkingWaypoint()`: Chọn điểm ẩn nấp ngoài FOV hoặc bị tường che ở tầm `3.4m–16.5m`.

### 5.5. Hệ thống Physical 3D Jumpscare (8 Kiểu A–H, 6 Pha, FOV Recoil & 11 Trigger Volumes)
- **8 kiểu (`JumpscareType`):**
  - `A_BEHIND_PLAYER` (Xuất hiện sau lưng, camera xoay nhanh nhìn lại)
  - `B_CORRIDOR_REVEAL` (Hiện rõ cuối hành lang / boong đò)
  - `C_CORNER_AMBUSH` (Phục kích góc khuất)
  - `D_SURFACE_REVEAL` (Trần Thị Liên bò thấp trên mặt sàn `crawling: true`, hạ `eyeY` xuống `0.62m`)
  - `E_SUDDEN_APPROACH` (Lao tới bất ngờ từ phía trước)
  - `F_LIGHT_TRIGGER` (Kích hoạt dưới ánh đèn)
  - `G_STATUE_MOVEMENT` (Tượng gỗ áp sát bất ngờ)
  - `H_WATER_EMERGENCE` (Hồn đứa trẻ trồi lên từ mặt nước giếng)
- **6 pha tiến trình (`getJumpscarePhase`):** `PREPARE` (0–8%) → `SPAWN` (8–22%) → `HOLD` (22–45%) → `LUNGE` (45–80%, kẹp khoảng cách an toàn `>= 1.26m` không xuyên camera) → `VANISH` (80–100%) → `COOLDOWN` (`34 giây` chống spam).
- **Camera Impact (`FirstPersonController.tsx`):** Kéo góc nhìn mượt về mắt NPC trong `0.52s–0.62s`, co giãn FOV `68° → 60° → 68°`, giật pitch nhẹ + rung camera (tôn trọng cài đặt `cameraShake` và `reduceFlashing`), **không bao giờ khóa chết điều khiển chuột**.
- **11 Trigger Volumes qua 5 màn (`JumpscareTriggers.ts`):**
  - Màn 1: `l1_well_scare` (Liên • `C_CORNER_AMBUSH`), `l1_sealed_scare` (Liên • `D_SURFACE_REVEAL` + `Crawling`).
  - Màn 2: `l2_banyan_scare` (Mây • `E_SUDDEN_APPROACH` + `SlowHeadRaise`), `l2_inner_scare` (Mây • `A_BEHIND_PLAYER` + `Lunge`) *(tự tắt nếu chọn `release`)*.
  - Màn 3: `l3_well_scare` (Child Spirit • `H_WATER_EMERGENCE` cố định tại tâm giếng `[0, 0.4, 0]`), `l3_headman_scare` (Liên • `F_LIGHT_TRIGGER`).
  - Màn 4: `l4_statue_scare` & `l4_sanctum_scare` (Tượng gỗ • `G_STATUE_MOVEMENT`), `l4_may_keep_ambush` (Mây • `A_BEHIND_PLAYER` nếu chọn `keep`).
  - Màn 5: `l5_boat_scare` (Hành khách • `B_CORRIDOR_REVEAL` + `StandUp`), `l5_may_keep_ambush` (Mây • `E_SUDDEN_APPROACH` nếu chọn `keep`).

### 5.6. Developer NPC Debug Panel (`F9` / `?debug=1`)
- Nằm tại `src/horror/debug/NPCDebugPanel.tsx` và `npcDebugBus.ts`.
- **Chỉ bật khi** `import.meta.env.DEV` hoặc URL có `?debug=1` (hoàn toàn ẩn & tốn `0ms` overhead trong bản chơi thật).
- Chức năng: hiển thị live `State`, `Clip`, tọa độ `[x, y, z]`, khoảng cách, cờ `FOV`, `LOS`, `FLASH`, `Opacity`, thời gian Cooldown; cho phép ép 4 nút Physical 3D Jumpscare (`May 3D Scare`, `Liên Crawl Scare`, `Statue Scare`, `Child Spirit`), chọn bất kỳ 1 trong 8 kiểu Jumpscare & 14 Animation Clip, kéo NPC ra trước mặt (`Front`), ép rình rập (`Stalk`), hoặc `Reset`.

---

## 6. HỆ THỐNG ĐỒ HỌA 3D PBR, ASSET PIPELINE & POST-PROCESSING (v4.5.1)

### 6.1. Chuẩn Hình Ảnh Thống Nhất (`VisualStandard.ts`)
- **Phong cách:** *Realistic Vietnamese Rural Psychological Horror* (không hoạt hình, không neon quá lố).
- **Tỷ lệ thực tế (mét):** Mắt đứng `1.65m`, ngồi `1.05m`, cửa cao `2.68m × 1.85m`, bàn thờ cao `1.10m`, thành giếng `1.02m`, cột lim bán kính `0.165m`, vì kèo cao `3.62m`.
- **Ánh sáng tương phản:** Ánh trăng lạnh (`#84a3cc`, cường độ `0.62`), đèn dầu ấm (`#ff8e30`), đèn lồng đỏ (`#d92622`), đèn pin cầm tay có **Lens Cookie** (`#fff2db`, cường độ `24`, tầm chiếu `25m`, trễ mượt theo tay cầm, chớp tắt khi gặp hiện tượng tâm linh).
- **Hậu kỳ tiết chế (`HorrorPostProcessing.tsx`):** `ACESFilmicToneMapping` (`exposure: 1.12`), Bloom ngưỡng cao `0.94` (chỉ phát sáng ngọn lửa đèn dầu/đèn lồng), Film Grain `0.024`, Vignette `0.72`, `ChromaticAberration = 0` khi khám phá bình thường (chỉ bùng lên khi có glitch/jumpscare).

### 6.2. Engine Vật Liệu PBR Procedural (`proceduralTextures.ts`)
Sinh tự động các bộ bản đồ 512px có cache toàn cục (không leak VRAM khi đổi màn):
- **Albedo (Diffuse)** + **Sobel RGB Tangent-Space Normal Map** (tạo chiều sâu vân gỗ, mạch vữa gạch cổ, tường vôi bong tróc, đá rêu phong) + **Roughness Map** + **Flashlight Cookie Texture**.
- Hỗ trợ 10+ loại bề mặt: `wood_dark`, `wood_old`, `plaster`, `brick`, `tile_floor`, `stone`, `dirt`, `altar_red`, `water`, `roof`, `bamboo`, `curtain`.

### 6.3. 17 Mẫu Mô Hình 3D Vật Chứng (`EvidenceModels.tsx`)
`comb`, `incense_bowl`, `ritual_paper`, `hairpin`, `torn_photo`, `rusted_knife`, `paper_doll`, `talisman`, `ancient_coin`, `diary`, `ancestral_tablet`, `royal_decree`, `drum_mallet`, `relief_fragment`, `lantern`, `rope`, `ledger`. Tất cả đều tương tác xoay 360°, phóng to và chứa điểm hotspot 3D thực sự theo hướng nhìn (`front / back / bottom / side`).

### 6.4. Asset Pipeline (`AssetPipeline.ts` & `ModelSlot.tsx`) & 4 Graphics Presets
- Tích hợp sẵn `GLTFLoader` + `DRACOLoader` (`/draco/`) + `KTX2Loader` (`/basis/`), `modelCache`, `inflightModels`, `AnimationMixer` registry, LOD descriptor (`lodUrl` + `lodDistance`), và `disposeObject3D()` giải phóng bộ nhớ GPU an toàn.
- **4 cấu hình đồ họa (`QUALITY_PROFILES`):**

| Preset | Shadow Map | Shadows | Max DPR | Bụi sáng | Lớp sương | Hạt mưa | Post-FX | Volumetric Moon |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `low` | 512 | Tắt | `1.0` | 24 | 5 | 0 | Tắt | Tắt |
| `medium` | 512 | Bật | `1.25` | 48 | 9 | 160 | Cơ bản | Bật |
| `high` *(mặc định)* | 1024 | Bật | `1.6` | 85 | 14 | 320 | Đầy đủ | Bật |
| `ultra` | 2048 | Bật | `2.0` | 120 | 18 | 520 | Đầy đủ | Bật |

---

## 7. HỆ THỐNG ÂM THANH 3D WEB AUDIO HRTF

File nguồn: `src/audio/horrorAudio.ts` (789 dòng) & `src/horror/jumpscare/JumpscareAudio.ts`.
- **Kiến trúc:** Web Audio API hoàn toàn không phụ thuộc file MP3 ngoài (chạy mượt 0ms load), tách 3 kênh gain độc lập: `masterGain`, `musicGain`, `sfxGain`.
- **Không gian 3D HRTF:** Mỗi frame trong `FirstPersonController.tsx` đồng bộ tọa độ & hướng nhìn camera vào `AudioListener`; âm thanh NPC phát qua `PannerNode` (`panningModel = 'HRTF'`, `distanceModel = 'inverse'`) tại đúng tọa độ 3D của NPC.
- **5 nền nhạc không gian (Ambient Themes):** `house`, `shrine`, `village`, `temple`, `river` (drone ngũ cung trầm, gió lùa biến thiên LFO, tiếng dế đêm 3D, giếng nhỏ giọt, mõ chùa, kẽo kẹt gỗ).
- **Âm thanh tương tác:** Bước chân phân biệt 4 bề mặt (`wood`, `stone`, `dirt`, `water`) & chạy/đi bộ, tiếng bật/tắt đèn pin, mở cửa gỗ kẹt, giải đố thành công/thất bại, nhịp tim đập (`playHeartbeat`).
- **6 bộ âm thanh không gian 3D đặc trưng cho 6 NPC (v5.0):**
  - **Đào Thị Mây:** `playSpatialBreathing`, bước chân đất nhẹ, stinger `pale_bride`, `playSpatialDisappear`.
  - **Trần Thị Liên:** `playWallScratching` (tiếng cào gỗ/tường 3 nhịp), hơi thở khàn, stinger `pale_bride`.
  - **Hồn Đứa Trẻ:** `playWaterBubble` (bong bóng nước giếng), `playWaterDrip`, stinger `blood_hands`.
  - **4 Tượng Quan Gỗ:** `playHeavyWoodImpact` (tiếng gỗ nặng dậm sàn + cọt kẹt), stinger `statue_face`.
  - **4 Hành Khách Không Mặt:** `playCollectiveWhisper` (tiếng thì thầm 3 dải tần chồng lớp), stinger `faceless_ferryman`.
  - **Ông Lão Lái Đò:** `playPaddleWater` (tiếng mái chèo khua nước), `playTempleBell` (chuông chùa trầm), stinger `faceless_ferryman`.

---

## 8. QUẢN LÝ TRẠNG THÁI (ZUSTAND), SAVE SCHEMA v4, UI/UX & PHÍM TẮT

### 8.1. State & Save Schema v4 (`src/store/gameStore.ts`)
- **Single Store:** Toàn bộ gameplay, điều tra, 5 màn, Narrative v3.1, horror state, cài đặt đồ họa/âm thanh nằm trong `useGameStore`.
- **Save Schema v4 (`SAVE_SCHEMA_VERSION = 4`):**
  - Tự động lưu có chống spam (`debounce`) sau mỗi hành động quan trọng & định kỳ 1.5s khi di chuyển.
  - Hàm `migrateAndSanitizeSave()`: Tự nâng cấp file save cũ v1 lên v4 (tự động cấp bù `coreTruths` cho màn đã qua), cắt gọn tọa độ người chơi vào trong `level.bounds` tránh rơi map, lọc bỏ các ID manh mối/lựa chọn rác, **tính lại `spiritScore` từ `moralChoices` hợp lệ**, và trả về `null` an toàn (không crash game) nếu JSON trong `localStorage` bị hỏng.

### 8.2. Hệ thống giao diện & Điều khiển

| Phím / Thao tác | Chức năng |
| :--- | :--- |
| `W / A / S / D` hoặc Mũi tên | Di chuyển 4 hướng |
| `Chuột` (Pointer Lock hoặc Giữ chuột kéo) | Xoay góc nhìn 360° (có fallback kéo chuột cho trình duyệt nhúng) |
| `Shift` | Chạy nhanh (tăng tiếng ồn đối với AI NPC) |
| `C` hoặc `Ctrl` | Ngồi xuống (hạ chiều cao `1.05m`, giảm tiếng ồn xuống `0.20`) |
| `F` | Bật / Tắt đèn pin (có pin tự xả/sạc & ảnh hưởng trực tiếp tới AI ma) |
| `E` | Tương tác vật chứng (mở 3D Inspect), Mở/Đóng cửa, Mở trạm giải đố |
| `Tab` | Mở / Đóng **Sổ Điều Tra 5 Tab** (*Vụ Án • Vật Chứng • Manh Mối • Nghi Phạm • Bảng Kết Nối Chỉ Đỏ*) |
| `I` | Mở / Đóng **Túi Đồ Vật Chứng** |
| `ESC` | Đóng modal hiện tại hoặc Mở **Menu Tạm Dừng** |
| `F9` *(Chỉ bản DEV / `?debug=1`)* | Bật / Tắt **3D NPC Debug Panel** |

**Cài đặt người dùng (`GameSettings`):** Âm lượng Tổng / Nhạc nền / Hiệu ứng, Độ nhạy chuột, Preset đồ họa (`low / medium / high / ultra`), Tỷ lệ phân giải (`0.6–1.5`), Hiển thị thông số FPS/GPU, Bật/Tắt Jumpscare, Giảm chớp nháy (`reduceFlashing`), Bật/Tắt rung camera (`cameraShake`).

---

## 9. KẾT QUẢ KIỂM THỬ QA, HIỆU NĂNG & LỊCH SỬ PHIÊN BẢN

### 9.1. Kết quả kiểm thử tự động & trình duyệt (Đo thực tế)
- **Vitest (`npm.cmd test`):** **29 / 29 tests PASS** (0 fail):
  - `narrativeAndSave.test.ts`: **15 tests** (Core Truths, khóa Moral Choice không cho ghi đè, Chính Khí, 3 Ending + 4 mã `darkReason`, vòng đời NG+, phục hồi save hỏng & chống gian lận `spiritScore`).
  - `levelsAndPuzzles.test.ts`: **3 tests** (toàn vẹn 5 màn, mật mã/chuỗi giải đố, mọi hotspot liên kết đúng clue ID, vật chứng 3D hợp lệ).
  - `npcAndJumpscare.test.ts`: **11 tests** (6 NPC, ngắt jumpscare khi Pause, chống spam cooldown, culling theo khoảng cách, chống spawn xuyên tường/cửa đóng, phản ứng Moral Choice/NG+, Pooling, Ray-march LOS qua cửa đóng/mở, Waypoint Navigation, GLB Bone Validator 15 xương, 16 Animation Clips & Jumpscare Types A–H + 6 pha).
- **Production Build (`tsc -b && vite build`):** **PASS trong `5.37s`** (0 lỗi TypeScript, 2.645 modules transformed).
- **Live Browser QA (`http://localhost:5173/?debug=1`, Preset `HIGH`):**
  - Console errors: **0** | Page errors: **0** | 2D/SVG ghosts: **0**.
  - Màn 1 (Nhà Gỗ Ba Gian): **~213–229 FPS** (`4.4–4.7ms`) | `DC: 297` | `Tri: 13.512`.
  - Màn 1 trong lúc Physical 3D Jumpscare Đào Thị Mây: **131 FPS** (`7.6ms`) | `DC: 320` | `Tri: 14.788`.
  - Màn 2 (Miếu Cô Đỏ — 2 NPC Đào Thị Mây active): **214 FPS** (`4.7ms`) | `DC: 152` | `Tri: 9.544`.

### 9.2. Lịch sử tiến hóa phiên bản (Git `main`)
1. **v1.0 – v3.0:** Khởi tạo nền tảng R3F, 5 màn chơi 3D, cơ chế Inspect 360°, Sổ Điều Tra, Bảng Kết Nối Chỉ Đỏ, Web Audio 3D và bộ vật liệu PBR sơ khởi.
2. **v4.0:** Hoàn thiện **Narrative Data Pack v3.1** (4 Core Truths, 3 Moral Choices, Chính Khí, 3 Ending, NG+), **Save Schema v4** chống hỏng dữ liệu, 4 Graphics Presets, code-splitting Vite, bộ test Vitest đầu tiên.
3. **v4.5.1:** Chuẩn hóa đồ họa **Realistic Vietnamese Rural Horror** (`VisualStandard.ts`), nâng cấp PBR Sobel Normal Map + Flashlight Cookie, hoàn thiện `AssetPipeline.ts` (GLB/Draco/KTX2/LOD) & `ModelSlot.tsx`, xây dựng cụm kiến trúc chuẩn mực **Level 1 Visual Benchmark**.
4. **v4.5.2:** Xóa bỏ hoàn toàn ma 2D/SVG trong `JumpscareOverlay.tsx`; xây dựng kiến trúc 6 nhóm **NPC Ma 3D toàn thân**, FSM 13 trạng thái, `NPCSpawnManager`, `NPCPooling` và **Physical 3D Jumpscare Director**.
5. **v5.0 (`60f1aee`):** Nâng cấp khớp nối 15 xương + 16 Animation Clips + `NPCModelValidator`, nâng cấp AI lên **Level 3** (Ray-march LOS `0.15m`, Waypoint Stalking, phản ứng đèn pin đặc thù của Mây & Liên), mở rộng **8 kiểu Physical Jumpscare (A–H)** + 6 pha + FOV recoil, bổ sung 6 bộ âm thanh 3D chuyên biệt, thêm **Developer NPC Debug Panel (`F9`)**, sửa lỗi floor-offset animation `Crawling`, đạt **29/29 tests PASS**.

---

## 10. CÁC HẠNG MỤC CÒN THIẾU (BLOCKED) & HƯỚNG DẪN TÍCH HỢP ASSET BLENDER / AUDIO

Báo cáo trung thực 2 hạng mục asset ngoại vi hiện **chưa có sẵn file nhị phân trong repository**:

1. **File model 3D `.glb` xuất từ Blender (`public/models/`) — Trạng thái: `BLOCKED` (chưa có asset)**
   - **Hiện trạng:** Game đang chạy hoàn chỉnh bằng mô hình 3D procedural có khớp nối (6 NPC 15 khớp + 17 vật chứng + kiến trúc Màn 1 Benchmark).
   - **Cách nâng cấp không cần sửa code gameplay:**
     - Với đạo cụ/kiến trúc: Đặt file `.glb` (nén Draco/KTX2) vào `public/models/` và mở comment cấu hình trong `MODEL_REGISTRY` tại `src/three/AssetPipeline.ts`.
     - Với nhân vật ma 3D (Đào Thị Mây, Trần Thị Liên...): Xuất file `.glb` từ Blender có `SkinnedMesh` chứa đủ 15 tên xương trong `REQUIRED_HUMANOID_BONES` và các clip đặt tên theo `NPCAnimationClipName`, đặt vào `public/models/npcs/` rồi gán `glbUrl` trong `src/horror/npc/NPCRegistry.ts`. `RiggedGLBAnimator` và `NPCModelValidator` đã sẵn sàng kiểm định và chạy crossfade tự động.

2. **File âm thanh thu âm thực tế / Lồng tiếng Việt (`.mp3` / `.ogg` trong `public/audio/`) — Trạng thái: `PARTIAL`**
   - **Hiện trạng:** Hệ thống Web Audio 3D HRTF đang tổng hợp 100% âm thanh không gian 3D thời gian thực (ổn định, tải tức thì).
   - **Hướng nâng cấp:** Có thể bổ sung lớp phát `AudioBuffer` cho giọng thì thầm tiếng Việt, tiếng đàn bầu/đàn nguyệt thu âm thật và tiếng mưa/gió làng quê thực tế qua cùng hệ thống `PannerNode` & 3 kênh gain (`master / music / sfx`) trong `src/audio/horrorAudio.ts`.
