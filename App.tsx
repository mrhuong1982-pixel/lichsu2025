import React, { useState } from 'react';
import { Palette, Music, Image as ImageIcon, Settings, Trash2, Plus, FileText, Play, Wand2, Grid, Layers, User, School, Upload, Download, FileSpreadsheet, FileType, MonitorPlay, Youtube, Link as LinkIcon, X, ExternalLink, LayoutTemplate, StretchHorizontal, Copy, Grip, Info } from 'lucide-react';
import { GameConfig, Question, DEFAULT_IMAGE } from './types';
import QuestionModal from './components/QuestionModal';
import GamePreview from './components/GamePreview';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const App: React.FC = () => {
  // State
  const [config, setConfig] = useState<GameConfig>({
    lessonName: 'Ôn tập Truyện Kiều - Nguyễn Du',
    hiddenImage: null,
    coverImage: null,
    coverImageMode: 'split',
    pieceImages: {},
    bgMusic: null,
    gridCols: 4,
    gridRows: 4,
    bgColor: '#ffffff',
    schoolName: 'YOUTUBE: SOẠN GIẢNG TV',
    teacherName: 'Soạn Giảng TV'
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      text: 'Tác giả của Truyện Kiều là ai?',
      answers: [
        { id: 'a1', text: 'Nguyễn Du', isCorrect: true },
        { id: 'a2', text: 'Nguyễn Trãi', isCorrect: false },
        { id: 'a3', text: 'Hồ Xuân Hương', isCorrect: false },
        { id: 'a4', text: 'Nguyễn Khuyến', isCorrect: false },
      ]
    },
    {
      id: 'q2',
      text: 'Bài thơ "Tây Tiến" của Quang Dũng được sáng tác vào năm nào?',
      answers: [
        { id: 'a1', text: '1948', isCorrect: true },
        { id: 'a2', text: '1947', isCorrect: false },
        { id: 'a3', text: '1954', isCorrect: false },
        { id: 'a4', text: '1960', isCorrect: false },
      ]
    },
    {
      id: 'q3',
      text: 'Trong tác phẩm "Vợ nhặt", Kim Lân đã xây dựng tình huống truyện độc đáo nào?',
      answers: [
        { id: 'a1', text: 'Nhặt được vợ trong nạn đói', isCorrect: true },
        { id: 'a2', text: 'Đi lính cho Pháp', isCorrect: false },
        { id: 'a3', text: 'Bị bắt đi phu', isCorrect: false },
        { id: 'a4', text: 'Gặp lại người thân', isCorrect: false },
      ]
    },
    {
      id: 'q4',
      text: 'Ai là người được mệnh danh là "Ông vua phóng sự đất Bắc"?',
      answers: [
        { id: 'a1', text: 'Vũ Trọng Phụng', isCorrect: true },
        { id: 'a2', text: 'Ngô Tất Tố', isCorrect: false },
        { id: 'a3', text: 'Nam Cao', isCorrect: false },
        { id: 'a4', text: 'Nguyễn Công Hoan', isCorrect: false },
      ]
    },
    {
      id: 'q5',
      text: 'Hình ảnh "Tiếng đàn bọt nước" xuất hiện trong tác phẩm nào?',
      answers: [
        { id: 'a1', text: 'Đàn ghi ta của Lor-ca', isCorrect: true },
        { id: 'a2', text: 'Sóng', isCorrect: false },
        { id: 'a3', text: 'Đất Nước', isCorrect: false },
        { id: 'a4', text: 'Việt Bắc', isCorrect: false },
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [tutorialVideo, setTutorialVideo] = useState<string | null>(null);
  const [youtubeLink, setYoutubeLink] = useState<string>('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Helper: File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Helper: Get YouTube Embed URL
  const getYoutubeEmbedUrl = (url: string) => {
    // Default to Soạn Giảng TV Channel Uploads Playlist if no URL provided
    // Channel ID: UCWOK4UHiYPb22i8Ub_UbKxA -> Uploads Playlist: UUWOK4UHiYPb22i8Ub_UbKxA
    const defaultEmbed = "https://www.youtube.com/embed/videoseries?list=UUWOK4UHiYPb22i8Ub_UbKxA";
    
    if (!url) return defaultEmbed;
    
    // Improved Regex to handle Watch, Embed, Shorts, and variations
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[1].length === 11) ? match[1] : null;

    // Handle Time Parameter (t=123 or t=1m23s) -> convert to ?start=123
    let startParam = "";
    const timeMatch = url.match(/[?&]t=(\d+)s?/);
    if (timeMatch && timeMatch[1]) {
        startParam = `?start=${timeMatch[1]}`;
    }

    return id ? `https://www.youtube.com/embed/${id}${startParam}` : defaultEmbed;
  };

  // Handlers
  const handleConfigChange = (key: keyof GameConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [cols, rows] = e.target.value.split('x').map(Number);
      setConfig(prev => ({ ...prev, gridCols: cols, gridRows: rows }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        handleConfigChange('hiddenImage', base64);
      } catch (err) {
        console.error("Error reading image", err);
      }
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        handleConfigChange('coverImage', base64);
      } catch (err) {
        console.error("Error reading cover image", err);
      }
    }
  };

  const handlePieceImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setConfig(prev => ({
            ...prev,
            pieceImages: {
                ...prev.pieceImages,
                [index.toString()]: base64
            }
        }));
      } catch (err) {
        console.error("Error reading piece image", err);
      }
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        handleConfigChange('bgMusic', base64);
      } catch (err) {
        console.error("Error reading music", err);
      }
    }
  };

  const handleTutorialVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        setTutorialVideo(url);
    }
  };

  const saveQuestion = (q: Question) => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(item => item.id === q.id ? q : item));
    } else {
      setQuestions(prev => [...prev, q]);
    }
    setEditingQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  // --- TEMPLATE DOWNLOAD LOGIC ---
  const handleDownloadTemplate = (type: 'json' | 'excel' | 'word') => {
    if (type === 'json') {
      const sampleData = [
        {
          text: "Câu hỏi mẫu 1?",
          answers: [
            { text: "Đáp án A (Sai)", isCorrect: false },
            { text: "Đáp án B (Đúng)", isCorrect: true },
            { text: "Đáp án C (Sai)", isCorrect: false },
            { text: "Đáp án D (Sai)", isCorrect: false }
          ]
        }
      ];
      const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mau_cau_hoi.json';
      link.click();
    } 
    else if (type === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws_data = [
        ["Nội dung câu hỏi", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng (A/B/C/D)"],
        ["Tác giả Truyện Kiều là ai?", "Nguyễn Trãi", "Nguyễn Du", "Quang Trung", "Nguyễn Huệ", "B"],
        ["Sóng là bài thơ của ai?", "Xuân Quỳnh", "Huy Cận", "Tố Hữu", "Chế Lan Viên", "A"]
      ];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, "Câu hỏi");
      XLSX.writeFile(wb, "mau_cau_hoi.xlsx");
    } 
    else if (type === 'word') {
      const content = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <h1>MẪU CÂU HỎI TRẮC NGHIỆM</h1>
          <p>Lưu ý: Đánh dấu * trước đáp án đúng.</p>
          <hr/>
          <p><b>Câu 1:</b> Tác giả của bài thơ Sóng là ai?</p>
          <p>A. *Xuân Quỳnh</p>
          <p>B. Nguyễn Khoa Điềm</p>
          <p>C. Tố Hữu</p>
          <p>D. Quang Dũng</p>
          <br/>
          <p><b>Câu 2:</b> "Tây Tiến" là tác phẩm của ai?</p>
          <p>A. Chính Hữu</p>
          <p>B. Hồng Nguyên</p>
          <p>C. *Quang Dũng</p>
          <p>D. Nguyễn Đình Thi</p>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mau_cau_hoi.doc';
      link.click();
    }
  };

  // --- HTML GAME EXPORT LOGIC ---
  const handleExportHtml = () => {
    if (questions.length < 1) return alert("Cần ít nhất 1 câu hỏi để xuất bản!");
    
    // Create simple standalone HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.lessonName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Nunito', sans-serif; background-color: ${config.bgColor}; }
        .hidden-image { object-fit: cover; width: 100%; height: 100%; }
        .piece { transition: all 0.5s; cursor: pointer; background-size: 100% 100%; background-repeat: no-repeat; }
        .piece:hover { opacity: 0.9; transform: scale(0.98); }
        .piece.revealed { opacity: 0; pointer-events: none; }
        @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); } }
        .animate-bounce { animation: bounce 1s infinite; }
        /* Style for text shadow to make numbers readable on images */
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
    </style>
</head>
<body class="h-screen w-screen flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="bg-white/90 backdrop-blur shadow-md p-4 flex justify-between items-center z-10">
        <div>
            <h1 class="text-xl md:text-2xl font-black text-indigo-600 uppercase truncate max-w-lg">${config.lessonName}</h1>
            <p class="text-xs md:text-sm font-bold text-gray-500">${config.schoolName} - ${config.teacherName}</p>
        </div>
        ${config.bgMusic ? `
        <audio controls loop autoplay>
            <source src="${config.bgMusic}" type="audio/mp3">
            <source src="${config.bgMusic}" type="audio/mpeg">
            <source src="${config.bgMusic}" type="audio/wav">
        </audio>` : ''}
    </div>

    <!-- Game Area -->
    <div class="flex-1 flex items-center justify-center p-4 relative">
        <div id="game-board" class="relative bg-white shadow-2xl rounded-xl overflow-hidden ring-8 ring-white/20" style="width: min(80vh, 100%); aspect-ratio: 1/1;">
            <img src="${config.hiddenImage || 'https://picsum.photos/800/600'}" class="absolute inset-0 w-full h-full object-cover">
            <div id="grid-overlay" class="absolute inset-0 grid w-full h-full transition-opacity duration-1000">
                <!-- Pieces generated by JS -->
            </div>
             <div id="win-screen" class="absolute inset-0 bg-black/60 z-20 hidden flex-col items-center justify-center text-white p-6 text-center">
                <div class="bg-yellow-400 p-4 rounded-full mb-4 animate-bounce text-white">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                </div>
                <h2 class="text-4xl md:text-5xl font-black mb-4 text-yellow-400">CHÚC MỪNG!</h2>
                <p class="text-xl mb-6">Bạn đã giải mã thành công bí ẩn!</p>
                <div class="flex gap-4">
                  <button onclick="hideWinScreen()" class="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg">Xem lại ảnh kết quả</button>
                  <button onclick="location.reload()" class="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg">Chơi lại</button>
                </div>
            </div>
        </div>
        
        <!-- Button to show win screen again -->
        <div id="show-win-btn" class="absolute top-4 right-4 z-20 hidden">
             <button onclick="showWinScreen()" class="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full font-bold backdrop-blur-sm transition flex items-center gap-2 text-sm">Hiện bảng chúc mừng</button>
        </div>
    </div>

    <!-- Question Modal -->
    <div id="modal" class="fixed inset-0 bg-black/60 z-50 hidden items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
            <div class="bg-indigo-600 p-4 md:p-6 text-white text-center relative flex-shrink-0">
                <h3 class="text-lg md:text-xl font-bold" id="modal-title">Câu hỏi</h3>
                <button onclick="closeModal()" class="absolute right-4 top-4 hover:bg-white/20 p-1 rounded"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div class="p-6 md:p-8 overflow-y-auto">
                <p id="question-text" class="text-lg md:text-xl text-gray-800 font-medium mb-6 md:mb-8 text-center leading-relaxed"></p>
                <div id="answers-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
            </div>
            <div id="feedback" class="p-4 text-center font-bold text-white hidden flex-shrink-0 flex-col items-center gap-2"></div>
        </div>
    </div>

    <script>
        const CONFIG = ${JSON.stringify(config)};
        const QUESTIONS = ${JSON.stringify(questions)};
        let revealedCount = 0;
        let currentPiece = null;
        let currentQuestion = null;

        const grid = document.getElementById('grid-overlay');
        const modal = document.getElementById('modal');
        const totalPieces = CONFIG.gridCols * CONFIG.gridRows;
        
        // Setup Grid
        grid.style.gridTemplateColumns = \`repeat(\${CONFIG.gridCols}, 1fr)\`;

        for(let i=0; i<totalPieces; i++) {
            const div = document.createElement('div');
            div.className = 'piece bg-indigo-600 border border-white/20 flex items-center justify-center relative';
            
            // Handle Custom Piece Images
            if (CONFIG.coverImageMode === 'custom' && CONFIG.pieceImages && CONFIG.pieceImages[i]) {
                div.style.backgroundImage = \`url(\${CONFIG.pieceImages[i]})\`;
                div.style.backgroundSize = 'cover';
                div.style.backgroundPosition = 'center';
                div.className = 'piece border border-white/20 flex items-center justify-center relative bg-no-repeat';
            }
            // Handle Cover Image Logic (Split or Repeat)
            else if(CONFIG.coverImage) {
                 div.style.backgroundImage = \`url(\${CONFIG.coverImage})\`;
                 
                 if (CONFIG.coverImageMode === 'repeat') {
                    // Avatar/Icon Mode
                    div.style.backgroundSize = 'cover';
                    div.style.backgroundPosition = 'center';
                 } else {
                    // Puzzle/Split Mode
                    const row = Math.floor(i / CONFIG.gridCols);
                    const col = i % CONFIG.gridCols;
                    
                    const xPos = CONFIG.gridCols > 1 ? (col * (100 / (CONFIG.gridCols - 1))) : 0;
                    const yPos = CONFIG.gridRows > 1 ? (row * (100 / (CONFIG.gridRows - 1))) : 0;
                    
                    div.style.backgroundSize = \`\${CONFIG.gridCols * 100}% \${CONFIG.gridRows * 100}%\`;
                    div.style.backgroundPosition = \`\${xPos}% \${yPos}%\`;
                 }
                 
                 div.className = 'piece border border-white/20 flex items-center justify-center relative bg-no-repeat';
            }

            // Always add number for reference
            const hasImage = (CONFIG.coverImageMode === 'custom' && CONFIG.pieceImages && CONFIG.pieceImages[i]) || CONFIG.coverImage;
            div.innerHTML = \`<span class="text-white font-bold text-2xl \${hasImage ? 'text-shadow' : 'opacity-50'}">\${i+1}</span>\`;
            div.onclick = () => handlePieceClick(i, div);
            div.id = \`piece-\${i}\`;
            grid.appendChild(div);
        }

        function handlePieceClick(index, element) {
            if(element.classList.contains('revealed')) return;
            if(QUESTIONS.length === 0) return alert('Không có câu hỏi!');
            
            currentPiece = element;
            // Get random question that hasn't been answered correctly yet (simplified for now: random)
            const qIndex = Math.floor(Math.random() * QUESTIONS.length);
            currentQuestion = QUESTIONS[qIndex];
            
            document.getElementById('modal-title').innerText = \`Mảnh ghép số \${index + 1}\`;
            document.getElementById('question-text').innerText = currentQuestion.text;
            
            const ansGrid = document.getElementById('answers-grid');
            ansGrid.innerHTML = '';
            
            currentQuestion.answers.forEach((ans, idx) => {
                const btn = document.createElement('button');
                btn.className = 'p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 text-left font-medium transition';
                btn.innerHTML = \`<span class="font-bold mr-2">\${String.fromCharCode(65+idx)}.</span> \${ans.text}\`;
                btn.onclick = () => checkAnswer(ans, btn);
                ansGrid.appendChild(btn);
            });

            document.getElementById('feedback').className = 'p-4 text-center font-bold text-white hidden flex-col items-center gap-2';
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function checkAnswer(answer, btnElement) {
            const feedback = document.getElementById('feedback');
            feedback.classList.remove('hidden');
            
            const buttons = document.querySelectorAll('#answers-grid button');
            buttons.forEach(b => b.disabled = true);

            if(answer.isCorrect) {
                btnElement.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
                feedback.innerHTML = '<span class="text-lg">CHÍNH XÁC!</span>';
                feedback.className = 'p-4 text-center font-bold text-white flex flex-col items-center gap-2 bg-green-500';
                
                setTimeout(() => {
                    closeModal();
                    currentPiece.classList.add('revealed');
                    revealedCount++;
                    if(revealedCount === totalPieces) {
                        document.getElementById('win-screen').classList.remove('hidden');
                        document.getElementById('win-screen').classList.add('flex');
                        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
                    }
                }, 1500);
            } else {
                btnElement.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
                feedback.innerHTML = '<span class="text-lg">SAI RỒI!</span><button onclick="retryQuestion()" class="mt-1 bg-white text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 shadow-md transition font-extrabold animate-pulse">LÀM LẠI CÂU HỎI</button>';
                feedback.className = 'p-4 text-center font-bold text-white flex flex-col items-center gap-2 bg-red-500';
            }
        }

        function retryQuestion() {
            document.getElementById('feedback').classList.add('hidden');
            const buttons = document.querySelectorAll('#answers-grid button');
            buttons.forEach(b => {
                 b.disabled = false;
                 // Reset styles
                 b.className = 'p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 text-left font-medium transition';
            });
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function hideWinScreen() {
             document.getElementById('win-screen').classList.remove('flex');
             document.getElementById('win-screen').classList.add('hidden');
             document.getElementById('grid-overlay').classList.add('opacity-0', 'pointer-events-none');
             document.getElementById('show-win-btn').classList.remove('hidden');
        }

        function showWinScreen() {
             document.getElementById('win-screen').classList.remove('hidden');
             document.getElementById('win-screen').classList.add('flex');
             document.getElementById('grid-overlay').classList.remove('opacity-0', 'pointer-events-none');
             document.getElementById('show-win-btn').classList.add('hidden');
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.lessonName.replace(/\s+/g, '_')}_Game.html`;
    link.click();
  };

  // --- FILE PROCESSING LOGIC ---
  const processExcel = (data: ArrayBuffer) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip header row
    const rows = jsonData.slice(1) as any[][];
    const newQuestions: Question[] = [];

    rows.forEach((row, index) => {
      if (row.length < 6) return; // Skip invalid rows
      
      const questionText = row[0];
      const ansA = row[1];
      const ansB = row[2];
      const ansC = row[3];
      const ansD = row[4];
      const correctChar = String(row[5]).trim().toUpperCase();

      if (questionText && ansA && ansB && ansC && ansD) {
        newQuestions.push({
          id: `excel-${Date.now()}-${index}`,
          text: questionText,
          answers: [
            { id: `a-${index}`, text: String(ansA), isCorrect: correctChar === 'A' },
            { id: `b-${index}`, text: String(ansB), isCorrect: correctChar === 'B' },
            { id: `c-${index}`, text: String(ansC), isCorrect: correctChar === 'C' },
            { id: `d-${index}`, text: String(ansD), isCorrect: correctChar === 'D' },
          ]
        });
      }
    });
    return newQuestions;
  };

  const processWord = async (arrayBuffer: ArrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    const text = result.value;
    
    // Simple heuristic parser
    // Assuming format: "Câu 1: ... \n A. ... \n B. ... " and * marks correct answer
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newQuestions: Question[] = [];
    let currentQ: Partial<Question> | null = null;
    let currentAnswers: any[] = [];

    for (const line of lines) {
      // Detect Question Start (e.g., "Câu 1:", "Câu 1.", "1.")
      if (line.match(/^(Câu\s+\d+|Bài\s+\d+|\d+)[.:]/i)) {
        if (currentQ && currentAnswers.length >= 2) {
           newQuestions.push({ ...currentQ, answers: currentAnswers } as Question);
        }
        currentQ = { id: `doc-${Date.now()}-${newQuestions.length}`, text: line.replace(/^(Câu\s+\d+|Bài\s+\d+|\d+)[.:]\s*/i, '') };
        currentAnswers = [];
      } else if (line.match(/^[A-D][.:]\s/i) && currentQ) {
         // Detect Answer (e.g., "A. Content")
         const isCorrect = line.includes('*') || line.includes('(Đúng)');
         const cleanText = line.replace(/^[A-D][.:]\s/i, '').replace('*', '').replace('(Đúng)', '').trim();
         currentAnswers.push({
           id: `ans-${newQuestions.length}-${currentAnswers.length}`,
           text: cleanText,
           isCorrect: isCorrect
         });
      }
    }
    // Push last question
    if (currentQ && currentAnswers.length >= 2) {
      newQuestions.push({ ...currentQ, answers: currentAnswers } as Question);
    }

    return newQuestions;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    try {
      let importedQuestions: Question[] = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
           importedQuestions = data.map((q: any, i: number) => ({
             id: q.id || `json-${Date.now()}-${i}`,
             text: q.text,
             answers: q.answers
           }));
        }
      } 
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        importedQuestions = processExcel(arrayBuffer);
      }
      else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        importedQuestions = await processWord(arrayBuffer);
      }
      else {
        alert("Định dạng file không hỗ trợ!");
        setIsImporting(false);
        return;
      }

      if (importedQuestions.length > 0) {
        setQuestions(prev => [...prev, ...importedQuestions]);
        alert(`Đã nhập thành công ${importedQuestions.length} câu hỏi.`);
      } else {
        alert("Không tìm thấy câu hỏi hợp lệ trong file. Vui lòng kiểm tra file mẫu.");
      }

    } catch (error) {
      console.error(error);
      alert("Lỗi khi đọc file: " + error);
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-800 font-sans pb-24">
      
      {/* Game Mode Overlay */}
      {isGameRunning && (
        <GamePreview 
          config={config} 
          questions={questions} 
          onClose={() => setIsGameRunning(false)} 
        />
      )}

      {/* Main Header */}
      <header className="bg-white shadow-sm pt-8 pb-4 text-center relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-2 px-4">
            <div className="bg-yellow-400 p-2 rounded-full shadow-lg flex-shrink-0">
                <Palette size={32} className="text-white" />
            </div>
            <h1 
                className="text-2xl md:text-4xl lg:text-5xl font-black text-indigo-600 tracking-tight uppercase text-center leading-tight"
                style={{ 
                    textShadow: '3px 3px 0px #fbbf24', 
                    WebkitTextStroke: '1.5px #1e1b4b'
                }}
            >
                TRÒ CHƠI GIẢI MÃ BÍ ẨN SAU MẢNH GHÉP
            </h1>
        </div>
        <p className="text-gray-500 font-bold text-sm uppercase">THIẾT KẾ SOẠN GIẢNG TV- CHIA SẺ, HỌC HỎI</p>
        <p className="text-green-500 font-bold text-sm uppercase mt-1">{config.schoolName}</p>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl flex flex-col gap-6">
        
        {/* Main Editor Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Question Bank (Now on Left) */}
          <section className="w-full lg:w-3/4 flex flex-col gap-4">
            
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-indigo-50 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-600" />
                <h2 className="font-bold text-lg text-gray-700">
                  Ngân Hàng Câu Hỏi <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md ml-1 text-sm">({questions.length})</span>
                </h2>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setQuestions([])}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold text-sm flex items-center gap-1 transition"
                >
                  <Trash2 size={16} /> Xóa hết
                </button>
                <button 
                  onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold text-sm flex items-center gap-1 shadow-lg shadow-indigo-200 transition"
                >
                  <Plus size={16} /> Thêm thủ công
                </button>
              </div>
            </div>

            {/* Import / Download Area */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unified Upload */}
                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center relative group">
                    <input 
                        type="file" 
                        accept=".json, .xlsx, .xls, .docx, .doc" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform">
                      {isImporting ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"/> : <Upload size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Nhập Câu Hỏi</p>
                      <p className="text-xs text-gray-500 mt-1">Hỗ trợ: Excel, Word, JSON</p>
                    </div>
                </div>

                {/* Download Templates */}
                <div className="border border-gray-200 bg-white rounded-2xl p-4 flex flex-col gap-2 justify-center">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase"><Download size={16}/> Tải mẫu cấu trúc chuẩn</h3>
                  <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleDownloadTemplate('excel')}
                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-green-100 bg-green-50 hover:bg-green-100 transition"
                      >
                        <FileSpreadsheet className="text-green-600 mb-1" size={20} />
                        <span className="text-xs font-bold text-green-700">Excel</span>
                      </button>
                      <button 
                        onClick={() => handleDownloadTemplate('word')}
                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <FileType className="text-blue-600 mb-1" size={20} />
                        <span className="text-xs font-bold text-blue-700">Word</span>
                      </button>
                      <button 
                        onClick={() => handleDownloadTemplate('json')}
                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-yellow-100 bg-yellow-50 hover:bg-yellow-100 transition"
                      >
                        <FileText className="text-yellow-600 mb-1" size={20} />
                        <span className="text-xs font-bold text-yellow-700">JSON</span>
                      </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center italic">Tải mẫu về để xem cách trình bày chính xác</p>
                </div>
              </div>

              {/* Instructions for Math/Science */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                <Info className="flex-shrink-0 text-blue-600" size={20} />
                <div>
                    <p className="font-bold mb-1 text-blue-700">Hướng dẫn nhập câu hỏi Toán, Lý, Hóa:</p>
                    <ul className="list-disc pl-4 space-y-1 text-blue-900/80">
                      <li>Phần mềm hỗ trợ hiển thị văn bản và ký tự đặc biệt.</li>
                      <li>Với các công thức đơn giản (H₂O, x², π, α, β...), hãy sử dụng <strong>ký tự Unicode</strong> hoặc copy từ các trang web ký tự.</li>
                      <li>Tránh sử dụng công thức dạng <strong>hình ảnh</strong> hoặc <strong>Equation Editor</strong> trong Word/Excel vì phần mềm không đọc được.</li>
                      <li>Nên soạn thảo trên Excel theo file mẫu để kiểm soát nội dung tốt nhất.</li>
                    </ul>
                </div>
              </div>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 overflow-hidden flex flex-col min-h-[400px]">
              <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1">
                {questions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
                    <Layers size={64} className="mb-4 opacity-20" />
                    <p>Chưa có câu hỏi nào.</p>
                    <p className="text-sm">Hãy thêm thủ công hoặc nhập từ file!</p>
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="group border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition bg-white relative">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded text-xs h-fit">#{idx + 1}</span>
                          <h3 className="font-bold text-gray-800">{q.text}</h3>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingQuestion(q); setIsModalOpen(true); }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                          >
                              <Settings size={16} />
                          </button>
                          <button 
                            onClick={() => deleteQuestion(q.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                              <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {q.answers.map((ans) => (
                          <div 
                            key={ans.id} 
                            className={`text-sm px-3 py-2 rounded-lg border ${ans.isCorrect ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 border-transparent text-gray-500'}`}
                          >
                            {ans.isCorrect && <span className="mr-1">✓</span>} {ans.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </section>

          {/* Right Panel: Configuration (Now on Right) */}
          <aside className="w-full lg:w-1/4 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-indigo-50">
              <h2 className="text-indigo-600 font-bold text-lg flex items-center gap-2 mb-4 border-b pb-2">
                <Settings size={20} /> Cấu Hình
              </h2>

              {/* Config Form */}
              <div className="space-y-4">
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tên bài học</label>
                  <input 
                    type="text" 
                    value={config.lessonName}
                    onChange={(e) => handleConfigChange('lessonName', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                    placeholder="Nhập tên bài học..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Giáo viên</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                    <User size={16} className="text-gray-400" />
                    <input 
                      type="text" 
                      value={config.teacherName}
                      onChange={(e) => handleConfigChange('teacherName', e.target.value)}
                      className="w-full text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Trường</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                    <School size={16} className="text-gray-400" />
                    <input 
                      type="text" 
                      value={config.schoolName}
                      onChange={(e) => handleConfigChange('schoolName', e.target.value)}
                      className="w-full text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Hidden Image Upload */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ảnh bí ẩn (Kết quả)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {config.hiddenImage ? (
                      <img src={config.hiddenImage} alt="Preview" className="h-20 w-full object-cover rounded-md" />
                    ) : (
                      <div className="flex flex-col items-center py-2 text-gray-400">
                        <ImageIcon size={24} />
                        <span className="text-xs mt-1">Chọn ảnh</span>
                      </div>
                    )}
                  </div>
                </div>

                 {/* Cover Image Upload & Mode Selector */}
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center justify-between">
                    <span>Ảnh che mảnh ghép</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1 rounded">Mới</span>
                  </label>
                  
                  {/* Mode Buttons */}
                   <div className="mb-2 flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => handleConfigChange('coverImageMode', 'split')}
                            className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 transition font-bold ${config.coverImageMode === 'split' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <StretchHorizontal size={12}/> Cắt ảnh
                        </button>
                        <button
                            onClick={() => handleConfigChange('coverImageMode', 'repeat')}
                            className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 transition font-bold ${config.coverImageMode === 'repeat' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Copy size={12}/> Lặp lại
                        </button>
                        <button
                            onClick={() => handleConfigChange('coverImageMode', 'custom')}
                            className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center gap-1 transition font-bold ${config.coverImageMode === 'custom' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Grip size={12}/> Tùy chỉnh
                        </button>
                    </div>

                  {/* UI for Split/Repeat Modes */}
                  {(config.coverImageMode === 'split' || config.coverImageMode === 'repeat') && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                        <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {config.coverImage ? (
                        <div className="relative h-20 w-full rounded-md overflow-hidden group-hover:opacity-90 transition">
                            <img src={config.coverImage} alt="Cover Preview" className={`h-full w-full ${config.coverImageMode === 'repeat' ? 'object-contain bg-gray-100' : 'object-cover'}`} />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <LayoutTemplate className="text-white"/>
                            </div>
                        </div>
                        ) : (
                        <div className="flex flex-col items-center py-2 text-gray-400">
                            <LayoutTemplate size={24} />
                            <span className="text-xs mt-1">Chọn ảnh che</span>
                        </div>
                        )}
                    </div>
                  )}

                  {/* UI for Custom Grid Mode */}
                  {config.coverImageMode === 'custom' && (
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-[10px] text-gray-500 mb-2 text-center">Nhấn vào từng ô để tải ảnh lên</p>
                          <div 
                            className="grid gap-1 w-full aspect-square"
                            style={{ gridTemplateColumns: `repeat(${config.gridCols}, 1fr)` }}
                          >
                              {Array.from({ length: config.gridCols * config.gridRows }).map((_, idx) => (
                                  <div 
                                    key={idx} 
                                    className="relative bg-white border border-gray-200 rounded overflow-hidden aspect-square flex items-center justify-center cursor-pointer hover:border-indigo-400 group"
                                  >
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handlePieceImageUpload(idx, e)}
                                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                      />
                                      {config.pieceImages[idx] ? (
                                          <img src={config.pieceImages[idx]} className="w-full h-full object-cover" />
                                      ) : (
                                          <span className="text-xs text-gray-300 font-bold group-hover:text-indigo-400">{idx + 1}</span>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  
                  {(!config.coverImage && config.coverImageMode !== 'custom') && <p className="text-[10px] text-gray-400 mt-1 italic">Nếu không chọn, sẽ dùng ô màu xanh mặc định.</p>}
                </div>

                {/* Music Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nhạc nền Game</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                    <input type="file" accept="audio/*" onChange={handleMusicUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {config.bgMusic ? (
                      <div className="w-full flex flex-col items-center">
                          <audio controls src={config.bgMusic} className="w-full h-8 mb-2" />
                          <span className="text-xs text-green-600 font-bold">Đã chọn nhạc</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2 text-gray-400">
                        <Music size={24} />
                        <span className="text-xs mt-1">Chọn nhạc nền (mp3)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Số ô câu hỏi (Bố cục)</label>
                  <div className="relative">
                    <select 
                      value={`${config.gridCols}x${config.gridRows}`}
                      onChange={handleLayoutChange}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-white"
                    >
                      <option value="2x2">4 ô (2x2)</option>
                      <option value="3x2">6 ô (3x2)</option>
                      <option value="3x3">9 ô (3x3)</option>
                      <option value="4x3">12 ô (4x3)</option>
                      <option value="4x4">16 ô (4x4)</option>
                      <option value="5x4">20 ô (5x4)</option>
                      <option value="5x5">25 ô (5x5)</option>
                      <option value="6x5">30 ô (6x5)</option>
                    </select>
                    <Grid size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Màu nền Game</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                    <input 
                      type="color" 
                      value={config.bgColor}
                      onChange={(e) => handleConfigChange('bgColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-none p-0"
                    />
                    <span className="text-xs text-gray-500">{config.bgColor}</span>
                  </div>
                </div>

              </div>
            </div>
          </aside>
        </div>

        {/* Video Tutorial Section - Compact */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                    <Youtube size={32} className="text-red-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-800 uppercase">KÊNH YOUTUBE: SOẠN GIẢNG TV</h2>
                    <p className="text-gray-500 text-sm">Cập nhật video hướng dẫn và bài giảng mới nhất!</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="bg-indigo-50 text-indigo-600 px-4 py-3 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center gap-2 whitespace-nowrap"
                >
                    <Play size={20} fill="currentColor" /> Xem Hướng Dẫn
                </button>
                <a 
                    href="https://www.youtube.com/@soangiangofficial/videos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg hover:shadow-red-200 hover:scale-105 transition flex items-center gap-2 whitespace-nowrap"
                >
                    <ExternalLink size={20} /> MỞ KÊNH YOUTUBE
                </a>
            </div>
        </section>

      </main>

      {/* Footer / Play Action */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t p-4 z-40">
        <div className="container mx-auto flex flex-col md:flex-row justify-center gap-4 max-w-4xl">
            <button 
              onClick={() => {
                if (questions.length < 1) return alert("Cần ít nhất 1 câu hỏi để chơi!");
                setIsGameRunning(true);
              }}
              className="flex-1 bg-gradient-to-r from-teal-500 to-green-600 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <MonitorPlay fill="currentColor" /> CHƠI THỬ GAME
            </button>

            <button 
              onClick={handleExportHtml}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <Download /> TẢI FILE GAME HTML
            </button>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsVideoModalOpen(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Youtube className="text-red-500"/> Hướng dẫn sử dụng</h3>
                      <button onClick={() => setIsVideoModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 bg-black">
                       <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
                          {tutorialVideo ? (
                              <video 
                                  controls 
                                  autoPlay
                                  src={tutorialVideo} 
                                  className="w-full h-full object-contain"
                              />
                          ) : (
                              <iframe 
                                  className="w-full h-full"
                                  src={getYoutubeEmbedUrl(youtubeLink)}
                                  title="Hướng dẫn sử dụng" 
                                  frameBorder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                  allowFullScreen
                                  referrerPolicy="strict-origin-when-cross-origin"
                              ></iframe>
                          )}
                      </div>
                  </div>

                  <div className="p-4 bg-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                       <div className="flex items-center gap-2 w-full md:w-auto flex-1 flex-wrap">
                           <div className="flex items-center gap-2 w-full">
                              <LinkIcon size={16} className="text-gray-400"/>
                              <input 
                                  type="text"
                                  placeholder="Dán link YouTube khác..."
                                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                                  value={youtubeLink}
                                  onChange={(e) => {
                                      setYoutubeLink(e.target.value);
                                      if(e.target.value) setTutorialVideo(null); 
                                  }}
                              />
                           </div>
                           {youtubeLink && (
                              <a 
                                href={youtubeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 ml-6"
                              >
                                <ExternalLink size={12}/> Không xem được? Mở trong tab mới
                              </a>
                           )}
                      </div>
                      
                       <div className="relative w-full md:w-auto">
                          <input 
                              type="file" 
                              accept="video/*" 
                              onChange={handleTutorialVideoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition w-full">
                              <Upload size={16} /> Tải video từ máy
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Modals */}
      <QuestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={saveQuestion}
        initialQuestion={editingQuestion}
      />

    </div>
  );
};

export default App;