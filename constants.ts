import { Question, Badge } from './types';

export const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly"
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- EXISTING MC QUESTIONS (Updated with type) ---
  {
    id: 'q1',
    type: 'multiple-choice',
    text: 'Nhà nước đầu tiên của nước ta có tên là gì?',
    options: ['Văn Lang', 'Âu Lạc', 'Vạn Xuân', 'Đại Cồ Việt'],
    correctIndex: 0
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    text: 'Ai là người đã dời đô từ Hoa Lư về Thăng Long?',
    options: ['Đinh Bộ Lĩnh', 'Lê Hoàn', 'Lý Thái Tổ', 'Trần Hưng Đạo'],
    correctIndex: 2
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    text: 'Chiến thắng Bạch Đằng năm 938 do ai lãnh đạo?',
    options: ['Lý Thường Kiệt', 'Ngô Quyền', 'Trần Hưng Đạo', 'Lê Lợi'],
    correctIndex: 1
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    text: 'Tên thật của chủ tịch Hồ Chí Minh khi sinh ra là gì?',
    options: ['Nguyễn Sinh Cung', 'Nguyễn Tất Thành', 'Nguyễn Ái Quốc', 'Văn Ba'],
    correctIndex: 0
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    text: 'Vị vua nữ duy nhất trong lịch sử phong kiến Việt Nam là ai?',
    options: ['Lê Chân', 'Dương Vân Nga', 'Lý Chiêu Hoàng', 'Nguyên Phi Ỷ Lan'],
    correctIndex: 2
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    text: 'Bài thơ "Nam Quốc Sơn Hà" gắn liền với cuộc kháng chiến chống quân nào?',
    options: ['Quân Mông Nguyên', 'Quân Thanh', 'Quân Tống', 'Quân Minh'],
    correctIndex: 2
  },
  {
    id: 'q7',
    type: 'multiple-choice',
    text: 'Quốc hiệu nước ta dưới thời nhà Nguyễn là gì?',
    options: ['Đại Nam', 'Đại Việt', 'Đại Ngu', 'Việt Nam'],
    correctIndex: 3
  },
  {
    id: 'q8',
    type: 'multiple-choice',
    text: 'Ai là người lãnh đạo cuộc khởi nghĩa Lam Sơn?',
    options: ['Nguyễn Trãi', 'Lê Lợi', 'Nguyễn Huệ', 'Phan Bội Châu'],
    correctIndex: 1
  },
  {
    id: 'q9',
    type: 'multiple-choice',
    text: 'Chiến thắng Điện Biên Phủ diễn ra vào năm nào?',
    options: ['1945', '1954', '1968', '1975'],
    correctIndex: 1
  },
  {
    id: 'q10',
    type: 'multiple-choice',
    text: 'Trường đại học đầu tiên của Việt Nam là gì?',
    options: ['Quốc Tử Giám', 'Học viện Phật giáo', 'Trường Đông Kinh Nghĩa Thục', 'Trường Bưởi'],
    correctIndex: 0
  },
  {
    id: 'q11',
    type: 'multiple-choice',
    text: 'Vua Quang Trung đại phá quân Thanh vào dịp nào?',
    options: ['Tết Đoan Ngọ', 'Tết Nguyên Đán', 'Rằm Tháng Tám', 'Lễ Vu Lan'],
    correctIndex: 1
  },
  {
    id: 'q12',
    type: 'multiple-choice',
    text: 'Thành Cổ Loa gắn liền với truyền thuyết nào?',
    options: ['Sơn Tinh Thủy Tinh', 'Thánh Gióng', 'An Dương Vương và Mỵ Châu - Trọng Thủy', 'Sự tích Hồ Gươm'],
    correctIndex: 2
  },
  {
    id: 'q13',
    type: 'multiple-choice',
    text: 'Tác giả của "Bình Ngô Đại Cáo" là ai?',
    options: ['Lý Thường Kiệt', 'Nguyễn Trãi', 'Trần Quốc Tuấn', 'Nguyễn Du'],
    correctIndex: 1
  },
  {
    id: 'q14',
    type: 'multiple-choice',
    text: 'Ba lần chiến thắng quân Mông - Nguyên gắn liền với triều đại nào?',
    options: ['Nhà Lý', 'Nhà Trần', 'Nhà Lê', 'Nhà Nguyễn'],
    correctIndex: 1
  },
  {
    id: 'q15',
    type: 'multiple-choice',
    text: 'Bác Hồ đọc bản Tuyên ngôn Độc lập tại đâu?',
    options: ['Quảng trường Ba Đình', 'Bến Nhà Rồng', 'Dinh Độc Lập', 'Pác Bó'],
    correctIndex: 0
  },
  {
    id: 'q16',
    type: 'multiple-choice',
    text: 'Hai Bà Trưng khởi nghĩa chống lại quân xâm lược nào?',
    options: ['Quân Nam Hán', 'Quân Đông Hán', 'Quân Tống', 'Quân Đường'],
    correctIndex: 1
  },
  {
    id: 'q17',
    type: 'multiple-choice',
    text: 'Vị tướng nào đã bóp nát quả cam vì căm thù giặc?',
    options: ['Trần Bình Trọng', 'Trần Quốc Toản', 'Phạm Ngũ Lão', 'Yết Kiêu'],
    correctIndex: 1
  },
  {
    id: 'q18',
    type: 'multiple-choice',
    text: 'Kinh đô của nhà Nguyễn nằm ở đâu?',
    options: ['Thăng Long', 'Hoa Lư', 'Phú Xuân (Huế)', 'Tây Đô'],
    correctIndex: 2
  },
  {
    id: 'q19',
    type: 'multiple-choice',
    text: 'Trống đồng Đông Sơn là biểu tượng của nền văn hóa nào?',
    options: ['Văn hóa Sa Huỳnh', 'Văn hóa Óc Eo', 'Văn hóa Đông Sơn', 'Văn hóa Hòa Bình'],
    correctIndex: 2
  },
  {
    id: 'q20',
    type: 'multiple-choice',
    text: 'Ngày Quốc khánh của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là ngày nào?',
    options: ['30/4', '1/5', '19/5', '2/9'],
    correctIndex: 3
  },

  // --- NEW QUESTIONS (10 items: DragDrop, FillBlank, ShortAnswer) ---
  
  // 1. Drag & Drop
  {
    id: 'q21',
    type: 'drag-drop',
    text: 'Sắp xếp các triều đại phong kiến sau theo đúng trình tự thời gian (Từ sớm nhất đến muộn nhất):',
    options: ['Nhà Ngô', 'Nhà Đinh', 'Nhà Tiền Lê', 'Nhà Lý'] // Correct order
  },
  
  // 2. Drag & Drop
  {
    id: 'q22',
    type: 'drag-drop',
    text: 'Sắp xếp các chiến thắng lịch sử sau theo trình tự thời gian:',
    options: ['Chiến thắng Bạch Đằng (938)', 'Chiến thắng Bạch Đằng (1288)', 'Chiến thắng Điện Biên Phủ (1954)', 'Chiến dịch Hồ Chí Minh (1975)']
  },

  // 3. Drag & Drop
  {
    id: 'q23',
    type: 'drag-drop',
    text: 'Sắp xếp tên các vị vua triều Nguyễn theo thứ tự trị vì:',
    options: ['Gia Long', 'Minh Mạng', 'Thiệu Trị', 'Tự Đức']
  },

  // 4. Fill in Blank
  {
    id: 'q24',
    type: 'fill-in-blank',
    text: 'Điền vào chỗ trống: "Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau ___ lấy nước".',
    correctAnswer: 'giữ'
  },

  // 5. Fill in Blank
  {
    id: 'q25',
    type: 'fill-in-blank',
    text: 'Quốc hiệu Việt Nam chính thức xuất hiện vào năm 1804 dưới triều đại nhà ___.',
    correctAnswer: 'Nguyễn'
  },

  // 6. Fill in Blank
  {
    id: 'q26',
    type: 'fill-in-blank',
    text: 'Người thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước vào năm ___.',
    correctAnswer: '1911'
  },

  // 7. Short Answer
  {
    id: 'q27',
    type: 'short-answer',
    text: 'Ai là người soạn thảo bản Tuyên ngôn Độc lập khai sinh ra nước Việt Nam Dân chủ Cộng hòa?',
    correctAnswer: 'Hồ Chí Minh'
  },

  // 8. Short Answer
  {
    id: 'q28',
    type: 'short-answer',
    text: 'Vị vua nào đã đặt quốc hiệu nước ta là Đại Cồ Việt?',
    correctAnswer: 'Đinh Bộ Lĩnh'
  },

  // 9. Short Answer
  {
    id: 'q29',
    type: 'short-answer',
    text: 'Chiến dịch Hồ Chí Minh lịch sử giải phóng hoàn toàn miền Nam diễn ra vào năm nào?',
    correctAnswer: '1975'
  },

  // 10. Short Answer
  {
    id: 'q30',
    type: 'short-answer',
    text: 'Kinh đô đầu tiên của nước Văn Lang nằm ở tỉnh nào hiện nay?',
    correctAnswer: 'Phú Thọ'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'bronze',
    name: 'Sử Gia Tập Sự',
    icon: '🥉',
    description: 'Đạt tổng 10 điểm',
    condition: (score) => score >= 10
  },
  {
    id: 'silver',
    name: 'Nhà Thông Thái',
    icon: '🥈',
    description: 'Đạt tổng 30 điểm',
    condition: (score) => score >= 30
  },
  {
    id: 'gold',
    name: 'Bác Học Sử Việt',
    icon: '🥇',
    description: 'Đạt tổng 45 điểm',
    condition: (score) => score >= 45
  },
  {
    id: 'master',
    name: 'Huyền Thoại',
    icon: '👑',
    description: 'Hoàn thành tất cả các cấp độ',
    condition: (score) => score >= 50 
  }
];