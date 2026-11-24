import { LevelData } from '../../types/game';

/**
 * MÀN 5 — BẾN PHÀ ĐẬP THỦY ĐIỆN LÂM VIÊN (04:45 RẠNG SÁNG 15/11/2004)
 * Quy mô bản đồ mở rộng: 64m × 64m (X: -32..32, Z: -32..32) — 6 khu vực nối liền:
 * 1) Con Đường Nhựa Triền Đập & Bốt Điện Thoại Vàng (Nam: Z 14..28)
 * 2) Trạm Gác Đập Thủy Điện — Bờ Tây (Tây Nam: X -26..-10, Z 8..22)
 * 3) Nhà Chờ Bến Phà Bỏ Hoang & Lán Kỹ Sư — Bờ Đông (Đông Nam: X 10..26, Z 8..22)
 * 4) Cầu Phao Dài Bắc Qua Lòng Hồ Mù Sương (Trung tâm: X -3.5..3.5, Z -10..8)
 * 5) Hòm Khóa Xích Cầu Phao (Cuối cầu phao: Z = -9.5)
 * 6) Chuyến Phà Sắt Cũ Giữa Lòng Hồ Đen (Bắc: X -6..6, Z -28..-10)
 *    -> Nơi 4 Bóng Người Mất Mặt & Ông Lâm Văn Khải đang chờ lời phán quyết cuối cùng!
 */
export const level5: LevelData = {
  id: 5,
  code: 'HỒ SƠ 05 • 2004 – BẾN PHÀ ĐẬP THỦY ĐIỆN',
  title: 'Chuyến Phà Không Giờ',
  subtitle: 'Lòng Hồ Thủy Điện Lâm Viên — Đối Chất Trước Bình Minh 15/11/2004',
  location: 'Bến Phà Cũ Dưới Chân Đập Thủy Điện Lâm Viên (Rộng 64×64m)',
  era: '04:45 Rạng sáng 15/11/2004 — Khép lại 10 năm bóng tối Đồi Sương',
  victim: 'Bốn linh hồn 2002–2000–1998–1994 & Người Cha Giữ Phà Ông Lâm Văn Khải',
  synopsis:
    'Sương mù trắng đục cuộn đặc trên mặt hồ thủy điện sâu thẳm trước giờ hừng đông. Bên bờ đường nhựa ướt mưa, chiếc bốt điện thoại công cộng màu vàng bỗng reo vang dù dây cáp đã đứt. Cuối dải cầu phao gỗ dài hun hút là Chuyến Phà Sắt rỉ sét treo bốn ngọn đèn bão đỏ — nơi bốn bóng người của bốn vụ án (Thu Hà, Hạ Vy, Bé Minh, Ông Hòa) ngồi lặng lẽ bên người lái phà mặc áo mưa cũ kỹ đang chờ bạn bước lên...',
  introQuote: 'Băng Đỏ, Huy Hiệu, Thẻ B3, Cuộn Phim — dây xích cầu phao chỉ hạ xuống khi người sống dám nhìn thẳng vào ký ức của chính mình...',
  ambientTheme: 'river',
  fogColor: '#060b0e',
  fogNear: 4.8,
  fogFar: 42,
  skyColor: '#030709',
  ambientLightColor: '#6d8896',
  ambientLightIntensity: 0.45,
  spawnPosition: [0, 1.65, 25.5],
  spawnYaw: 0,
  bounds: { minX: -32, maxX: 32, minZ: -32, maxZ: 32 },
  surfaceZones: [
    { minX: -4.2, maxX: 4.2, minZ: -29, maxZ: 8, surface: 'wood' },
    { minX: -32, maxX: 32, minZ: 8, maxZ: 32, surface: 'stone' },
    { minX: -32, maxX: 32, minZ: -32, maxZ: 8, surface: 'water' },
  ],
  mapZones: [
    { id: 'z_l5_road', name: 'Đường Đập Thủy Điện & Bốt Điện Thoại', x: 0, z: 22 },
    { id: 'z_l5_west_station', name: 'Trạm Gác Đập Nước (Bờ Tây)', x: -18, z: 15 },
    { id: 'z_l5_east_waiting', name: 'Nhà Chờ Phà Cũ (Bờ Đông)', x: 18, z: 15 },
    { id: 'z_l5_pontoon', name: 'Cầu Phao Gỗ Ra Giữa Hồ', x: 0, z: -1 },
    { id: 'z_l5_ferry', name: 'Chuyến Phà Sắt Không Giờ', x: 0, z: -19 },
  ],
  hidingSpots: [
    {
      id: 'hide_l5_phone_booth',
      name: 'Bốt Điện Thoại Công Cộng Đầu Dốc',
      position: [-6.5, 0, 20.5],
      rotationY: Math.PI / 2,
      exitPosition: [-4.5, 1.65, 20.5],
      visualType: 'locker',
    },
    {
      id: 'hide_l5_waiting_curtain',
      name: 'Quầy Vé Bạt Cũ Nhà Chờ Bờ Đông',
      position: [21.5, 0, 14.5],
      rotationY: -Math.PI / 2,
      exitPosition: [19.5, 1.65, 14.5],
      visualType: 'curtain_booth',
    },
  ],
  tiers: [
    {
      tier: 1,
      title: 'Thu thập hồ sơ bờ đập & Xác thực 4 Chứng Vật Mở Cầu Phao',
      objective: 'Kiểm tra Sổ Trực Bến Phà đầu cầu, Đèn Bão Trạm Gác Tây, Xâu Thẻ Khóa ở Nhà Chờ Đông và Lá Thư Thú Nhận của ông Lâm Văn Khải trên Cầu Phao. Cảnh giác với Biên bản nghiệm thu giả!',
      completionHint: 'Xoay 360° tìm đúng thứ tự 4 chứng vật Đông → Nam → Tây → Bắc trên Sổ Trực Bến Phà.',
    },
    {
      tier: 2,
      title: 'Giải mã Hòm Khóa Liên Động & Hạ Xích Chắn Cầu Phao',
      objective: 'Nối hai nửa danh sách hành khách trên Bảng Kết Nối (Tab), rồi xoay đúng 4 vòng mã chứng vật (Băng Đỏ → Huy Hiệu → Thẻ B3 → Cuộn Phim) để hạ xích bước lên Chuyến Phà.',
      completionHint: 'Nối manh mối 2 chứng vật đầu (Đông – Nam) với 2 chứng vật cuối (Tây – Bắc) trước khi mở Hòm Sắt cuối cầu phao.',
    },
    {
      tier: 3,
      title: 'Đối Diện Cha Ruột Ông Lâm Văn Khải & Tuyên Phán Quyết Cuối Cùng',
      objective: 'Bước lên boong Chuyến Phà Sắt giữa 4 bóng người mất mặt, soi Thẻ Kỹ Sư Thủy Điện của bố bạn và đưa ra quyết định mở ra 1 trong 4 Kết Cục (Secret / True / Bittersweet / Dark Ending).',
      completionHint: 'Nếu đã thu thập đủ 4 Chân Lý + 4 Mật Vật Ẩn + Lương Tâm (+2) và chọn Tha Thứ, bạn sẽ mở khóa Kết Cục Bí Mật thứ 4!',
    },
  ],
  tier1RequiredClues: 4,
  tier2RequiredConnections: ['l5_conn_1'],
  tier2Puzzle: {
    kind: 'code_lock',
    id: 'l5_ferryman_chest',
    tier: 2,
    title: 'Hòm Khóa Sắt Liên Động Cuối Cầu Phao',
    subtitle:
      'Bốn đĩa khắc ký hiệu khóa chặt sợi xích sắt ngăn giữa cầu phao và mạn phà. Hãy xoay đúng 4 chứng vật ứng với 4 vụ án theo thứ tự Đông (2002) → Nam (2000) → Tây (1998) → Bắc (1994).',
    hintNote: 'Đối chiếu 2 trang Sổ Trực Bến Phà ở đầu cầu phao: Đông → Nam → Tây → Bắc.',
    hints: {
      level1: 'Kiểm tra hai trang của Cuốn sổ trực bến phà đặt trên trụ gỗ đầu cầu phao.',
      level2: 'Vào Bảng Kết Nối (Tab) nối manh mối chứng vật Đông–Nam với Tây–Bắc.',
      level3: 'Thứ tự chính xác: Băng Đỏ (2002) → Huy Hiệu (2000) → Thẻ B3 (1998) → Cuộn Phim (1994).',
    },
    requiredConnectionIds: ['l5_conn_1'],
    dials: [
      { label: 'Đông (2002)', options: ['Huy Hiệu', 'Băng Đỏ', 'Giấy Nợ', 'Đèn'] },
      { label: 'Nam (2000)', options: ['Băng Đỏ', 'Thẻ B3', 'Huy Hiệu', 'Thư Giả'] },
      { label: 'Tây (1998)', options: ['Thẻ B3', 'Cuộn Phim', 'Băng Đỏ', 'Dao'] },
      { label: 'Bắc (1994)', options: ['Đèn', 'Giấy Báo', 'Cuộn Phim', 'Huy Hiệu'] },
    ],
    solution: ['Băng Đỏ', 'Huy Hiệu', 'Thẻ B3', 'Cuộn Phim'],
    successNarrative:
      'Ổ khóa sắt bung chốt vang dội mặt hồ! Dây xích nặng nề chìm xuống làn nước đen; trên khoang phà mù sương, cả bốn bóng người của bốn vụ án đồng loạt đứng dậy quay về phía bạn...',
  },
  tier3Puzzle: {
    kind: 'deduction',
    id: 'l5_truth_deduction',
    tier: 3,
    title: 'Cuộc Đối Chất Lúc Không Giờ Trước Bình Minh (15/11/2004)',
    subtitle:
      'Người đàn ông gầy gò mặc áo mưa sẫm chậm rãi bỏ mũ xuống dưới ánh đèn bão mũi phà — chính là bố ruột của bạn, kỹ sư Lâm Văn Khải. Suốt 4 năm kể từ đêm Hạ Vy mất, ông đã một mình giữ bến phà hoang này để bảo vệ chứng cứ và đợi ngày bạn tìm lại toàn bộ ký ức.',
    hintNote: 'Tổng hợp Thư của ông Lâm Văn Khải, Sổ Trực Phà và Thẻ Kỹ Sư Thủy Điện trên boong phà rồi chọn phán quyết cuối cùng.',
    hints: {
      level1: 'Soi kỹ Thẻ Kỹ Sư Thủy Điện đặt trên bàn gỗ giữa khoang phà.',
      level2: 'Đọc lại lá thư thú nhận của bố bạn ở giữa cầu phao.',
      level3: 'Xác nhận toàn bộ chân tướng 10 năm Đồi Sương Lâm Viên và chọn Tha Thứ hoặc Phán Xét Nghiêm Khắc.',
    },
    moralChoice: {
      choiceId: 'judgment_nguyen_van_khai',
      title: 'Lựa Chọn Cuối Cùng — Đối Với Cha Ruột Ông Lâm Văn Khải',
      prompt:
        'Ông Lâm Văn Khải đã lặng lẽ thu thập chứng cứ suốt 4 năm để cứu bạn khỏi cạm bẫy của Viện trưởng Bách, nhưng cũng đã giấu bạn sự thật về đêm bạn lên cơn hoảng loạn khóa cửa sân thượng năm 2000 khiến hai cha con xa cách trong dằn vặt. Bạn chọn tha thứ hay phán xét nghiêm khắc ông?',
      options: [
        {
          value: 'forgive',
          label: 'Ôm lấy người cha già & Tha thứ tất cả (Forgive)',
          consequenceHint: 'Mở Kết Cục Bí Mật (nếu đủ 4 Mật Vật Ẩn) hoặc Kết Cục Thật (nếu đủ 4 Chân Lý & Lương Tâm +2).',
        },
        {
          value: 'condemn',
          label: 'Buộc ông ra đầu thú vì 4 năm che giấu hiện trường (Condemn)',
          consequenceHint: 'Mở Kết Cục Ngậm Ngùi (nếu đủ 4 Chân Lý & Lương Tâm +2).',
        },
      ],
    },
    questions: [
      {
        id: 'q1',
        prompt: 'Người Gác Phà âm thầm gửi băng cassette gọi bạn về Đồi Sương Lâm Viên đêm 14/11/2004 thực chất là ai?',
        options: [
          { id: 'a', label: 'Ông Lâm Văn Khải — bố ruột của bạn và Hạ Vy, người đã dành trọn 4 năm thu thập 4 đầu mối để giúp bạn khôi phục ký ức và đưa tội ác ra ánh sáng' },
          { id: 'b', label: 'Viện trưởng Vũ Đình Bách cải trang' },
          { id: 'c', label: 'Một nhân viên bưu điện lạ mặt' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'q2',
        prompt: 'Bốn bóng người lặng lẽ trên chuyến phà đêm đại diện cho đúng 4 nạn nhân và mốc năm nào?',
        options: [
          { id: 'a', label: 'Y tá Thu Hà (2002 • Băng Đỏ), Lâm Hạ Vy (2000 • Huy Hiệu), Bé Minh (1998 • Thẻ B3) và Kỹ sư Hòa (1994 • Cuộn Phim)' },
          { id: 'b', label: 'Bốn hành khách lỡ chuyến xe đò' },
          { id: 'c', label: 'Bốn bảo vệ của khu tập thể' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'q3',
        prompt: 'Sự thật toàn diện đằng sau bi kịch gia đình bạn đêm 14/11/2000 là gì?',
        options: [
          { id: 'a', label: 'Sóng hạ âm làm tái phát di chứng xóa ký ức B3-09 khiến bạn tưởng mình đang chặn kẻ xấu cho em gái; kẻ trực tiếp truy đuổi sát hại và ngụy tạo vụ tự sát của Hạ Vy là Hiệu phó Bảo và đường dây của Viện trưởng Bách' },
          { id: 'b', label: 'Do tai nạn sạt lở đất tự nhiên' },
          { id: 'c', label: 'Không có bất kỳ âm mưu nào tại thị trấn' },
        ],
        correctOptionId: 'a',
      },
    ],
    successNarrative:
      'Lời cuối cùng đã được nói ra. Mặt nước hồ thủy điện Lâm Viên khẽ gợn sóng đón vệt sáng đầu tiên của ngày 15/11/2004...',
    epilogueText:
      'Con phà sắt rẽ màn sương trắng tiến về phía kết cục do chính trí tuệ và lương tâm của bạn định đoạt.',
  },
  evidences: [
    {
      id: 'l5_ledger',
      levelId: 5,
      name: 'Sổ Trực Bến Phà & Danh Mục 4 Chứng Vật',
      shortDesc: 'Cuốn sổ bìa da ướt mưa đặt trên trụ cột đầu cầu phao.',
      fullDesc:
        'Ông Lâm Văn Khải đã tổng hợp toàn bộ 4 mắt xích Đông – Nam – Tây – Bắc thành 4 mật mã mở hòm xích phà.',
      modelType: 'ledger',
      importance: 'then_chot',
      worldPosition: [-1.8, 1.02, 7.2],
      worldScale: 0.7,
      locationName: 'Đầu Cầu Phao Bến Đập',
      hotspots: [
        {
          id: 'l5_hs_ledger_p1',
          label: 'Trang 1: Hướng Đông (2002) & Hướng Nam (2000)',
          position: [0.05, 0.2, 0.12],
          faceHint: 'front',
          discoveryText: 'Vị trí I (Đông – 2002 – Y tá Thu Hà): "Băng Đỏ". Vị trí II (Nam – 2000 – Lâm Hạ Vy): "Huy Hiệu".',
          unlocksClueId: 'l5_c1',
        },
        {
          id: 'l5_hs_ledger_p2',
          label: 'Trang 2: Hướng Tây (1998) & Hướng Bắc (1994)',
          position: [0.05, -0.2, 0.12],
          faceHint: 'front',
          discoveryText: 'Vị trí III (Tây – 1998 – Khu B3): "Thẻ B3". Vị trí IV (Bắc – 1994 – Kỹ sư Hòa): "Cuộn Phim".',
          unlocksClueId: 'l5_c2',
        },
      ],
    },
    {
      id: 'l5_lantern',
      levelId: 5,
      name: 'Đèn Bão Đỏ Trạm Gác Đập (Bờ Tây)',
      shortDesc: 'Chiếc đèn dầu chống bão treo trong Trạm Gác Đập phía Tây.',
      fullDesc:
        'Thắp sáng tờ sơ đồ hướng dẫn cách gửi toàn bộ chứng cứ cho Đoàn Thanh Tra Đặc Biệt lúc 6h sáng.',
      modelType: 'lantern',
      importance: 'quan_trong',
      worldPosition: [-18.2, 1.12, 15.2],
      worldScale: 0.7,
      locationName: 'Trạm Gác Đập Nước (Bờ Tây)',
      hotspots: [
        {
          id: 'l5_hs_lantern_in',
          label: 'Mảnh giấy kẹp dưới đế đèn bão',
          position: [0, 0.34, 0.14],
          faceHint: 'front',
          discoveryText: '"Muốn lật đổ đường dây của Bách trước tòa, phải giữ trọn 4 Chân Lý Cốt Lõi và không tiêu hủy bất kỳ bằng chứng nào."',
          unlocksClueId: 'l5_c3',
        },
      ],
    },
    {
      id: 'l5_fake_report',
      levelId: 5,
      name: 'Biên Bản Kết Luận Đuối Nước Khép Hồ Sơ (Nghi vấn giả)',
      shortDesc: 'Tờ thông cáo cũ dán trong Nhà Chờ Phà Bờ Đông.',
      fullDesc:
        'Văn bản chính thức năm 2000 khẳng định vụ việc tại hồ Lâm Viên chỉ là tai nạn cá nhân không có dấu hiệu hình sự.',
      modelType: 'talisman',
      importance: 'nhieu_gia',
      isRedHerring: true,
      worldPosition: [22.2, 1.18, 17.5],
      worldRotation: [0, -Math.PI / 2, 0],
      worldScale: 0.68,
      locationName: 'Nhà Chờ Phà Cũ (Bờ Đông)',
      hotspots: [
        {
          id: 'l5_hs_fake_seal',
          label: 'Chữ ký phê duyệt vội trong đêm',
          position: [0, -0.18, 0.05],
          faceHint: 'front',
          discoveryText: '[MANH MỐI NHIỄU] Biên bản kết luận không khám nghiệm được ký lúc 04h00 sáng ngày 15/11/2000 — trước cả khi thi thể Hạ Vy được vớt lên!',
          unlocksClueId: 'l5_c_fake',
        },
      ],
    },
    {
      id: 'l5_coins',
      levelId: 5,
      name: 'Chùm Chìa Khóa & Bốn Thẻ Đồng Đánh Số (Nhà Chờ Đông)',
      shortDesc: 'Chùm 4 thẻ đồng đánh dấu 4 tủ lưu trữ mật của ông Lâm Văn Khải.',
      fullDesc:
        'Đặt trên ghế băng gỗ trong Nhà Chờ Phà Bờ Đông cạnh chiếc túi vải bạt sờn rách.',
      modelType: 'ancient_coin',
      importance: 'quan_trong',
      worldPosition: [16.5, 0.88, 14.8],
      worldScale: 0.68,
      locationName: 'Nhà Chờ Phà Cũ (Bờ Đông)',
      hotspots: [
        {
          id: 'l5_hs_coins_mark',
          label: 'Chữ khắc "L.V.Khải" trên móc khóa',
          position: [0.22, 0.15, 0.1],
          faceHint: 'side',
          discoveryText: 'Chứng minh người âm thầm gửi băng cassette về thành phố gọi bạn trở lại Đồi Sương chính là bố ruột bạn!',
          unlocksClueId: 'l5_c4',
        },
      ],
    },
    {
      id: 'l5_letter',
      levelId: 5,
      name: 'Bức Thư Của Người Cha Giữa Cầu Phao (14/11/2004)',
      shortDesc: 'Lá thư viết tay bọc túi nilon chống nước buộc trên lan can giữa Cầu Phao.',
      fullDesc:
        'Tâm thư dài 3 trang của kỹ sư Lâm Văn Khải gửi con trai Lâm Hoàng Quân đúng kỷ niệm 4 năm ngày mất của Hạ Vy.',
      modelType: 'ritual_paper',
      importance: 'then_chot',
      worldPosition: [1.8, 1.02, -1.5],
      worldRotation: [-Math.PI / 2, 0, -0.2],
      worldScale: 0.68,
      locationName: 'Giữa Cầu Phao Bến Phà',
      hotspots: [
        {
          id: 'l5_hs_letter_sign',
          label: 'Lời giải thích nghẹn ngào của bố',
          position: [0, -0.15, 0.06],
          faceHint: 'front',
          discoveryText: '"Quân ơi, đêm 14/11/2000 bố đưa con đang ngất mê man rời khỏi trường để bọn Bách không thủ tiêu cả con. Bố xin lỗi vì đã giấu con suốt 4 năm — hãy mở xích lên phà đối diện cùng bố!"',
          unlocksClueId: 'l5_c5',
        },
      ],
    },
    {
      id: 'l5_token',
      levelId: 5,
      name: 'Thẻ Kỹ Sư Thủy Điện Của Ông Lâm Văn Khải',
      shortDesc: 'Tấm thẻ công tác ép nhựa cũ đặt trên bàn cabin giữa Chuyến Phà Sắt.',
      fullDesc:
        'Vật chứng cuối cùng nằm giữa bốn bóng người của bốn vụ án trên khoang phà mù sương.',
      modelType: 'ancestral_tablet',
      importance: 'then_chot',
      worldPosition: [-1.4, 0.96, -19.5],
      worldScale: 0.72,
      locationName: 'Khoang Giữa Chuyến Phà Sắt',
      requiresTier: 3,
      hotspots: [
        {
          id: 'l5_hs_token_name',
          label: 'Ảnh chân dung hai con kẹp mặt sau thẻ',
          position: [0, 0.05, 0.09],
          faceHint: 'front',
          discoveryText: 'Sau tấm thẻ kỹ sư của ông Lâm Văn Khải là tấm ảnh cũ chụp Hoàng Quân và Hạ Vy cười rạng rỡ ngày nhập học — thứ đã giữ ông sống sót suốt 4 mùa đông canh giữ sự thật.',
          unlocksClueId: 'l5_c6',
        },
      ],
    },
  ],
  clues: [
    {
      id: 'l5_c1',
      levelId: 5,
      title: 'Mã khóa I & II: Băng Đỏ (2002) → Huy Hiệu (2000)',
      summary: 'Hai đĩa khóa đầu tiên của Hòm Sắt ứng với hướng Đông (Băng Đỏ) và hướng Nam (Huy Hiệu).',
      sourceName: 'Sổ Trực Bến Phà',
      tier: 1,
      boardX: 18,
      boardY: 22,
    },
    {
      id: 'l5_c2',
      levelId: 5,
      title: 'Mã khóa III & IV: Thẻ B3 (1998) → Cuộn Phim (1994)',
      summary: 'Hai đĩa khóa cuối ứng với hướng Tây (Thẻ B3) và hướng Bắc (Cuộn Phim).',
      sourceName: 'Sổ Trực Bến Phà',
      tier: 1,
      boardX: 50,
      boardY: 20,
    },
    {
      id: 'l5_c_fake',
      levelId: 5,
      title: '[NGỤY TẠO] Biên bản đuối nước ký trước khi vớt xác',
      summary: 'Bằng chứng về sự thông đồng bao che có hệ thống ngay trong đêm 14/11/2000.',
      sourceName: 'Biên Bản Nhà Chờ Phà',
      tier: 1,
      boardX: 82,
      boardY: 22,
      isRedHerring: true,
    },
    {
      id: 'l5_c3',
      levelId: 5,
      title: 'Điều kiện lật lại toàn bộ đại án lúc bình minh',
      summary: 'Cần giữ nguyên vẹn 4 Chân Lý Cốt Lõi và Lương Tâm trong sạch (+2) trước giờ thanh tra tới.',
      sourceName: 'Đèn Bão Trạm Gác Đập',
      tier: 1,
      boardX: 20,
      boardY: 58,
    },
    {
      id: 'l5_c4',
      levelId: 5,
      title: 'Người gửi băng cassette chính là ông Lâm Văn Khải',
      summary: 'Chùm thẻ đồng xác nhận bố ruột bạn đã sắp đặt toàn bộ lộ trình giải mã đêm 14/11/2004.',
      sourceName: 'Chùm Chìa Khóa & Thẻ Đồng',
      tier: 2,
      boardX: 48,
      boardY: 58,
    },
    {
      id: 'l5_c5',
      levelId: 5,
      title: 'Lý do người cha im lặng suốt 4 năm (2000–2004)',
      summary: 'Ông Khải đưa Quân đang ngất rời hiện trường năm 2000 để bảo vệ mạng sống cho đứa con còn lại.',
      sourceName: 'Bức Thư Giữa Cầu Phao',
      tier: 2,
      boardX: 78,
      boardY: 58,
    },
    {
      id: 'l5_c6',
      levelId: 5,
      title: 'Tấm ảnh hai anh em sau Thẻ Kỹ Sư Thủy Điện',
      summary: 'Tất cả sự thật đã trọn vẹn trên boong phà — chỉ còn chờ quyết định cuối cùng của bạn.',
      sourceName: 'Thẻ Kỹ Sư Thủy Điện',
      tier: 3,
      boardX: 50,
      boardY: 86,
    },
  ],
  suspects: [
    {
      id: 'l5_s1',
      levelId: 5,
      name: 'Kỹ Sư Lâm Văn Khải (Người Gác Phà)',
      role: 'Cha ruột của Hoàng Quân & Hạ Vy',
      description: 'Cựu kỹ sư trưởng đập thủy điện Lâm Viên, người sống ẩn dật dưới bến phà cũ từ cuối năm 2000.',
      alibi: 'Tự giam mình bên hồ sương suốt 4 năm để thu thập hồ sơ chống lại Viện trưởng Bách.',
      secretClueId: 'l5_c5',
      secretNote: 'Ông sẵn sàng nhận mọi lời kết tội hoặc sự tha thứ từ chính đứa con trai của mình.',
    },
    {
      id: 'l5_s2',
      levelId: 5,
      name: 'Bốn Bóng Người Trên Khoang Phà Đêm',
      role: 'Thu Hà (2002) • Hạ Vy (2000) • Bé Minh (1998) • Ông Hòa (1994)',
      description: 'Bốn hình bóng lặng lẽ dưới mái phà sắt chờ đợi sự thật được phát đi trước ánh bình minh.',
      alibi: 'Mắc kẹt trong màn sương Đồi Lâm Viên suốt một thập kỷ.',
      secretClueId: 'l5_c1',
      secretNote: 'Họ chỉ thực sự siêu thoát khi bạn giữ trọn Lương Tâm và khép lại đại án.',
    },
  ],
  boardConnections: [
    {
      id: 'l5_conn_1',
      clueA: 'l5_c1',
      clueB: 'l5_c2',
      title: 'Mật mã Hòm Khóa Cầu Phao: Băng Đỏ → Huy Hiệu → Thẻ B3 → Cuộn Phim',
      deductionText: 'Bốn chứng vật theo đúng trình tự Đông → Nam → Tây → Bắc mở khóa xích lên Chuyến Phà Không Giờ.',
    },
    {
      id: 'l5_conn_2',
      clueA: 'l5_c4',
      clueB: 'l5_c5',
      title: 'Bốn năm đơn độc canh giữ sự thật của người cha',
      deductionText: 'Ông Lâm Văn Khải đã đánh đổi tất cả để giữ mạng sống cho bạn năm 2000 và dẫn bạn tới chân lý đêm nay.',
    },
  ],
  boxes: [
    // 64x64m Dam Embankment Shore & Reservoir Water
    { id: 'l5_shore', position: [0, -0.1, 19.5], size: [64, 0.2, 24], material: 'stone' },
    { id: 'l5_water', position: [0, -0.4, -10.5], size: [66, 0.1, 44], material: 'water' },

    // Shore Perimeter & Embankment Guardrails
    { id: 'l5_peri_s', position: [0, 1.5, 31.5], size: [64, 3.0, 0.5], material: 'stone', collidable: true },
    { id: 'l5_peri_w', position: [-31.5, 1.5, 19.5], size: [0.5, 3.0, 24], material: 'stone', collidable: true },
    { id: 'l5_peri_e', position: [31.5, 1.5, 19.5], size: [0.5, 3.0, 24], material: 'stone', collidable: true },
    { id: 'l5_shore_guard_w', position: [-17.5, 0.8, 8.0], size: [27, 1.6, 0.4], material: 'metal', collidable: true },
    { id: 'l5_shore_guard_e', position: [17.5, 0.8, 8.0], size: [27, 1.6, 0.4], material: 'metal', collidable: true },

    // West Dam Control Station (X: -25..-11, Z: 10..21) — open East doorway
    { id: 'l5_ws_floor', position: [-18, 0.04, 15.5], size: [14, 0.15, 11], material: 'tile_floor' },
    { id: 'l5_ws_roof', position: [-18, 3.4, 15.5], size: [14.6, 0.25, 11.6], material: 'stone' },
    { id: 'l5_ws_n', position: [-18, 1.7, 10], size: [14, 3.4, 0.36], material: 'brick', collidable: true },
    { id: 'l5_ws_s', position: [-18, 1.7, 21], size: [14, 3.4, 0.36], material: 'brick', collidable: true },
    { id: 'l5_ws_w', position: [-25, 1.7, 15.5], size: [0.36, 3.4, 11], material: 'brick', collidable: true },
    { id: 'l5_ws_desk', position: [-18.2, 0.48, 15.2], size: [2.2, 0.96, 1.1], material: 'metal', collidable: true },

    // East Abandoned Ferry Waiting House (X: 11..25, Z: 10..21) — open West doorway
    { id: 'l5_es_floor', position: [18, 0.04, 15.5], size: [14, 0.15, 11], material: 'tile_floor' },
    { id: 'l5_es_roof', position: [18, 3.4, 15.5], size: [14.6, 0.25, 11.6], material: 'roof' },
    { id: 'l5_es_n', position: [18, 1.7, 10], size: [14, 3.4, 0.36], material: 'plaster', collidable: true },
    { id: 'l5_es_s', position: [18, 1.7, 21], size: [14, 3.4, 0.36], material: 'plaster', collidable: true },
    { id: 'l5_es_e', position: [25, 1.7, 15.5], size: [0.36, 3.4, 11], material: 'plaster', collidable: true },
    { id: 'l5_es_bench', position: [16.5, 0.42, 14.8], size: [2.2, 0.84, 0.9], material: 'wood_old', collidable: true },

    // Long Floating Wooden Pontoon Pier (X: -3.2..3.2, Z: -10.5..8.2)
    { id: 'l5_pier_deck', position: [0, 0.0, -1.2], size: [6.4, 0.24, 19.0], material: 'wood_old' },
    { id: 'l5_pier_rail_w', position: [-3.2, 0.7, -1.2], size: [0.2, 1.4, 19.0], material: 'metal', collidable: true },
    { id: 'l5_pier_rail_e', position: [3.2, 0.7, -1.2], size: [0.2, 1.4, 19.0], material: 'metal', collidable: true },
    { id: 'l5_crate_w', position: [-1.8, 0.44, 7.2], size: [1.0, 0.88, 1.0], material: 'wood_dark', collidable: true },
    { id: 'l5_crate_e', position: [1.8, 0.44, -1.5], size: [1.0, 0.88, 1.0], material: 'wood_dark', collidable: true },

    // Large Steel Ferryboat Moored in Reservoir (X: -5.2..5.2, Z: -27.5..-10.5)
    { id: 'l5_boat_deck', position: [0, 0.04, -19.0], size: [10.4, 0.28, 17.0], material: 'metal' },
    { id: 'l5_boat_hull_w', position: [-5.2, 0.75, -19.0], size: [0.28, 1.5, 17.0], material: 'metal', collidable: true },
    { id: 'l5_boat_hull_e', position: [5.2, 0.75, -19.0], size: [0.28, 1.5, 17.0], material: 'metal', collidable: true },
    { id: 'l5_boat_bow', position: [0, 0.85, -27.5], size: [10.6, 1.7, 0.4], material: 'metal', collidable: true },
    { id: 'l5_boat_canopy', position: [0, 3.5, -19.0], size: [8.8, 0.22, 11.5], material: 'metal' },
    { id: 'l5_boat_table', position: [-1.4, 0.44, -19.5], size: [1.5, 0.88, 1.4], material: 'wood_old', collidable: true },
  ],
  doors: [
    {
      id: 'door_l5_ferry_gate',
      name: 'Xích Chắn Cầu Phao Lên Chuyến Phà Sắt',
      position: [0, 1.25, -10.4],
      size: [6.0, 2.5, 0.2],
      lockedByPuzzleId: 'l5_ferryman_chest',
      lockedMessage: 'Dây xích sắt khóa chặt lối lên phà. Hãy nối đủ 4 chứng vật trên Bảng Kết Nối rồi giải mã Hòm Khóa cuối cầu phao!',
      hasTalisman: true,
    },
  ],
  lamps: [
    { id: 'l5_lamp_road', position: [0, 4.0, 22], color: '#fbbf24', intensity: 4.8, distance: 18, flicker: true, type: 'oil_lamp' },
    { id: 'l5_lamp_ws', position: [-18, 2.8, 15.5], color: '#dc2626', intensity: 4.8, distance: 13, flicker: true, type: 'lantern' },
    { id: 'l5_lamp_es', position: [18, 2.8, 15.5], color: '#9cb8d9', intensity: 4.4, distance: 13, flicker: true, type: 'moonlight' },
    { id: 'l5_lamp_pier', position: [0, 2.6, -8.5], color: '#f59e0b', intensity: 5.2, distance: 14, flicker: true, type: 'lantern' },
    { id: 'l5_lamp_boat_l', position: [-3.8, 2.9, -16.5], color: '#dc2626', intensity: 5.0, distance: 14, flicker: true, type: 'lantern' },
    { id: 'l5_lamp_boat_r', position: [3.8, 2.9, -16.5], color: '#dc2626', intensity: 5.0, distance: 14, flicker: true, type: 'lantern' },
    { id: 'l5_lamp_bow', position: [0, 2.2, -24.8], color: '#fbbf24', intensity: 5.8, distance: 15, flicker: true, type: 'oil_lamp' },
  ],
  puzzleStations: [
    {
      id: 'l5_st_chest',
      puzzleId: 'l5_ferryman_chest',
      name: 'Hòm Khóa Sắt Cuối Cầu Phao',
      promptLabel: 'Xoay 4 chứng vật hạ xích phà (Tầng 2)',
      position: [2.1, 0.95, -9.2],
      visualType: 'ferry_chest',
    },
    {
      id: 'l5_st_truth',
      puzzleId: 'l5_truth_deduction',
      name: 'Đèn Bão Cabin Mũi Phà',
      promptLabel: 'Đối diện Ông Lâm Văn Khải & Phán quyết (Tầng 3)',
      position: [0, 1.08, -24.5],
      requiresTier: 3,
      visualType: 'truth_altar',
    },
  ],
  horrorAnchors: [
    { id: 'l5_pass_1', position: [-3.2, 0.14, -15.5], rotationY: 0.4, type: 'faceless_passenger', minHorror: 0.0 },
    { id: 'l5_pass_2', position: [3.2, 0.14, -15.8], rotationY: -0.4, type: 'faceless_passenger', minHorror: 0.0 },
    { id: 'l5_pass_3', position: [-3.1, 0.14, -21.5], rotationY: 0.35, type: 'faceless_passenger', minHorror: 0.0 },
    { id: 'l5_pass_4', position: [3.1, 0.14, -21.5], rotationY: -0.35, type: 'faceless_passenger', minHorror: 0.0 },
  ],
  horrorWhispers: [
    '“Quân ơi... bốn năm rồi bố vẫn neo con phà này đợi con về...”',
    'Chuông bốt điện thoại công cộng trên dốc đập bỗng reo vang rồi tắt phụt trong màn mưa...',
    'Tiếng sóng hồ đập ì oạp vào mạn phà sắt lạnh buốt...',
    'Bốn bóng người dưới mái phà lặng lẽ ngước lên nhìn ánh bình minh sắp ló rạng...',
  ],
  ngPlusWhispers: [
    '[NG+] Ông Lâm Văn Khải nói khẽ: "Nếu con đã gom đủ cả 4 Mật Vật Ẩn trong các mật thất, hãy nghe hết mặt B cuộn băng của bé Hạ Vy".',
  ],
};
