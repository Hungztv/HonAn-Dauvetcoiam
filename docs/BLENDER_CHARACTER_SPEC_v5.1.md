# HỒN ÁN – DẤU VẾT CÕI ÂM (v5.1)
## TÀI LIỆU YÊU CẦU MODEL 3D CHO BLENDER ARTIST & CHECKLIST XUẤT GLB

> **Mục đích:** Chuẩn hóa toàn bộ yêu cầu kỹ thuật & nghệ thuật để 3D Character Artist / Rigger / Animator sản xuất và xuất file `.glb` thả trực tiếp vào dự án mà **không cần sửa bất kỳ dòng code AI hay gameplay nào**.
>
> **Phong cách nghệ thuật bắt buộc:** *Photorealistic Vietnamese Rural Psychological Horror* — không hoạt hình, không low-poly thô, không fantasy phương Tây, không tạo hình người mẫu thời trang quá sạch sẽ.

---

## 1. CẤU TRÚC THƯ MỤC ASSET ĐÍCH

Đặt các file đã xuất vào đúng đường dẫn sau trong thư mục `public/`:

```text
public/
├── models/
│   └── npcs/
│       ├── dao-thi-may/                 # ƯU TIÊN SỐ 1
│       │   ├── dao-thi-may.glb          # High LOD (15k–30k tris)
│       │   └── dao-thi-may-lod.glb      # Medium/Far LOD (6k–10k tris, tùy chọn)
│       ├── tran-thi-lien/
│       │   └── tran-thi-lien.glb
│       ├── well-child/
│       │   └── well-child.glb
│       ├── wooden-statues/
│       │   └── wooden-statue.glb
│       ├── faceless-passengers/
│       │   └── faceless-passenger.glb
│       └── ferryman/
│           └── ferryman.glb
└── audio/
    └── npcs/
        ├── dao-thi-may/                 # may_scream_short.ogg, may_barefoot_step.ogg, may_female_breath_whisper.ogg, may_disappear_whoosh.ogg
        ├── tran-thi-lien/               # lien_gasp_scare.ogg, lien_crawl_wood_scratch.ogg, lien_raspy_breath.ogg, lien_cloth_drag_fade.ogg
        ├── well-child/                  # child_well_splash_scare.ogg, child_water_bubble.ogg, child_well_knock.ogg, child_submerge.ogg
        ├── wooden-statues/              # statue_heavy_slam.ogg, statue_heavy_step.ogg, statue_wood_creak.ogg, statue_wood_crack.ogg
        ├── faceless-passengers/         # passengers_collective_gasp.ogg, passengers_deck_step.ogg, passengers_collective_whisper.ogg, passengers_cloth_rustle.ogg
        └── ferryman/                    # ferryman_bell_gong.ogg, ferryman_oar_paddle.ogg, ferryman_boat_creak.ogg, ferryman_mist_fade.ogg
```

**Kích hoạt trong code sau khi thả file thật:**
1. Model GLB: Đổi `glbAssetPresent: true` (hoặc gán `glbUrl`) cho từng nhân vật trong `src/horror/npc/NPCRegistry.ts`.
2. Âm thanh thật: Đổi `enabled: true` cho từng nhân vật trong `src/horror/jumpscare/JumpscareAudio.ts`.
3. Mở game ở `http://localhost:5173/?debug=1` (phím `F9`) → bấm **Validate** để xác nhận trạng thái `VALID` (hoặc kiểm tra cảnh báo).

---

## 2. NHÂN VẬT ƯU TIÊN SỐ 1 — ĐÀO THỊ MÂY (1968 – MIẾU CÔ GÁI ÁO ĐỎ)

| Thông số | Yêu cầu bắt buộc |
| :--- | :--- |
| **Chiều cao thực tế** | **`1.64m`** (sai số cho phép `< ±10%`; vượt `±22%` sẽ bị `NPCModelValidator` cảnh báo, vượt `±50%` sẽ bị `INVALID`) |
| **Origin & Mặt đất** | Origin `(0, 0, 0)` nằm chính giữa hai bàn chân trần, `boundingBox.min.y` trong khoảng `[-0.05m, +0.05m]`, mặt hướng `+Z` |
| **Ngân sách đa giác** | High LOD: `18.000 – 32.000 triangles`; Medium LOD: `7.000 – 12.000 triangles` |
| **Hình thể & Ngoại hình** | Phụ nữ Việt Nam trưởng thành ~20–24 tuổi, da nhợt ẩm tự nhiên, hốc mắt sâu, chân trần, bàn tay & ngón tay gầy chi tiết. Áo dài đỏ thẫm cũ (phai màu, sờn rách nhẹ ở gấu, bám bụi ẩm đất), không sạch bóng như đồ mới. |
| **Tóc dài** | Mesh tóc riêng dùng **Hair Cards** (alpha cutout/blend gọn), rũ dài phủ quá nửa khuôn mặt; có cụm bone tóc (`Hair_Front_L/R`, `Hair_Back_01..03`) để tóc rẽ nhẹ khi thực hiện `SlowHeadRaise` và bay nhẹ khi `Lunge`. |
| **Tà áo dài** | Mesh áo dài riêng tách rời phần thân; có tối thiểu 2 chuỗi bone tà trước/sau (`Dress_Front_01..02`, `Dress_Back_01..02`) để đung đưa khi bước đi mà không xuyên đùi. |
| **Texture PBR** | Đóng gói trong GLB (1K–2K max cho web): `BaseColor` (`sRGB`), `Normal` (`OpenGL +Y`, Linear), `Roughness` + `Metallic` + `AO` (Linear / ORM packed). |

---

## 3. HỢP ĐỒNG BỘ XƯƠNG 15 KHỚP BẮT BUỘC (`REQUIRED_HUMANOID_BONES`)

`NPCModelValidator.ts` hỗ trợ ánh xạ tự động tên chuẩn v5, Mixamo (`mixamorig:*`), và Blender Rigify (`DEF-*`), nhưng **khuyến nghị đặt đúng tên chuẩn** sau:

```text
Hips
├── Spine
│   └── Chest
│       ├── Neck
│       │   └── Head          (+ tùy chọn: Jaw, LeftEye, RightEye, Hair_*)
│       ├── LeftArm           (+ tùy chọn: LeftShoulder)
│       │   └── LeftForeArm
│       │       └── LeftHand  (+ tùy chọn: Finger bones)
│       └── RightArm          (+ tùy chọn: RightShoulder)
│           └── RightForeArm
│               └── RightHand
├── LeftLeg
│   └── LeftFoot
└── RightLeg
    └── RightFoot
```

**Kiểm tra Skin Weight bắt buộc trước khi xuất:**
- **0 vertex có tổng weight = 0 hoặc NaN** (Validator v5.1 sẽ quét thuộc tính `skinWeight` và cảnh báo từng vertex lỗi!).
- Tối đa 4 xương ảnh hưởng trên 1 vertex (`Limit Total = 4` + `Normalize All` trong Blender Weight Paint).
- Không gãy khuỷu tay, không xoắn vai khi giơ tay `ReachForward` / `Lunge`.

---

## 4. HỢP ĐỒNG 16 ANIMATION CLIPS & CHÍNH SÁCH ROOT MOTION

**Chính sách Root Motion:** Tất cả animation **BẮT BUỘC là In-Place** (không dịch chuyển tọa độ XZ của bone `Hips` ra khỏi gốc). `NPCNavigation.ts` điều khiển di chuyển thế giới; `RiggedGLBAnimator` cũng tự khóa XZ của `Hips` để chống trượt chân.

| Clip Name (đặt đúng tên trong NLA/Action) | Loop | Yêu cầu chất lượng chuyển động | Ưu tiên theo NPC |
| :--- | :---: | :--- | :--- |
| `Idle` | Loop | Đứng bất động, thở rất khẽ, tóc & ngón tay nhúc nhích nhẹ | Tất cả 6 NPC |
| `HeadTilt` | Loop | Nghiêng đầu chậm bất thường, cổ & vai có độ trễ tự nhiên | Mây, Liên, Trẻ, Tượng, Hành khách |
| `SlowHeadRaise` | Loop/Hold | **Clip chủ lực của Mây:** cúi đầu tóc che mặt → ngẩng chậm để lộ dần đôi mắt | **Đào Thị Mây (#1)** |
| `SlowWalk` | Loop | Bước chậm nặng nề, nhịp chân không đều, tà áo dài & tóc rung theo bước | Mây, Tượng, Hành khách, Lái đò |
| `BackwardWalk` | Loop | Bước lùi mặt vẫn hướng về đèn pin người chơi | **Đào Thị Mây** |
| `LimpWalk` | Loop | Dáng đi khập khiễng đau đớn kéo lê 1 chân | **Trần Thị Liên** |
| `Crawling` | Loop | Bò sát sàn (giữ toàn bộ thân/đầu **phía trên `y = 0`**, đầu ngẩng nhìn lên) | **Trần Thị Liên** |
| `ShieldFace` | Loop | Giơ cẳng tay trái che mặt, vai co rúm khi gặp đèn pin | **Trần Thị Liên** |
| `ReachForward` | Loop | Vươn hai tay về phía trước, các ngón tay co quắp | Mây, Liên, Trẻ, Tượng |
| `Lunge` | Loop | Lao mạnh về phía trước, đầu & thân đồng bộ | Mây, Liên, Tượng |
| `JumpscareAttack` | Loop | Chồm vồ kịch tính cho Physical 3D Jumpscare | Mây, Liên |
| `SittingIdle` | Loop | Ngồi bất động trên ghế thuyền | Hành khách, Lái đò |
| `StandUp` | Once | Đứng dậy đồng loạt từ tư thế ngồi | Hành khách, Lái đò |
| `Rowing` | Loop | Cầm mái chèo gỗ đẩy nước đều nhịp | **Ông Lão Lái Đò** |
| `WaterRise` | Loop/Once | Từ từ trồi lên từ mặt nước giếng | **Hồn Đứa Trẻ** |
| `Disappear` | Once | Tan biến nhẹ kết hợp hạ opacity/dissolve | Tất cả NPC |

---

## 5. CHECKLIST XUẤT GLB TỪ BLENDER (Blender 3.6 / 4.x)

- [ ] **Apply Transforms (`Ctrl+A → All Transforms`)** trên cả Armature & Mesh trước khi xuất (`Scale = 1, 1, 1`, `Rotation = 0, 0, 0`).
- [ ] **Hướng chuẩn:** Nhân vật nhìn về `+Y` trong Blender (tự động thành `+Z` trong glTF/Three.js khi bật `+Y Up`).
- [ ] **Chiều cao đúng chuẩn:** Mây `1.64m`, Liên `1.62m`, Hồn trẻ `0.96m`, Tượng gỗ `2.05m`, Hành khách `1.68m`, Lái đò `1.70m`.
- [ ] **Bàn chân chạm đúng mặt sàn `Z = 0` (Blender) / `Y = 0` (Three.js).**
- [ ] **Export glTF 2.0 (`.glb` Binary):**
  - Format: `glTF Binary (.glb)`
  - Transform: `+Y Up = ON`
  - Geometry: `Apply Modifiers = ON`, `UVs = ON`, `Normals = ON`, `Tangents = ON`
  - Compression: `Draco = ON` (nếu dự án đã copy decoder vào `public/draco/`, nếu chưa có bộ giải mã local thì tạm tắt Draco để tải thẳng không lỗi)
  - Animation: `Bake All Objects Animations = ON`, `Group by NLA Track = ON`, `Always Sample Animations = ON`, `Limit to Playback Range = ON`
  - Skinning: `Export Skinning = ON`, `Include All Bone Influences = OFF` (giữ max 4)
- [ ] **Dung lượng khuyến nghị:** `< 8 MB` / nhân vật High LOD, `< 3 MB` / Medium LOD (texture WebP/JPEG/KTX2 tối đa `2048×2048`).
- [ ] **Giấy phép (License):** Lưu nguồn gốc & giấy phép hợp lệ (CC0 / CC-BY / tự tạo nguyên bản / mua bản quyền thương mại) trước khi commit vào repo.
