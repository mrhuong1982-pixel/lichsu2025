import React, { useState, useEffect, useRef } from 'react';
import { User, Question, GameConfig, QuestionType } from '../types';
import { getUsers, getQuestions, getGameConfig, saveUsers, saveQuestions, saveGameConfig, deleteUser, saveUser } from '../services/storage';
import { Button } from './Button';
import { 
  Trash2, Edit3, Plus, Save, Settings, 
  FileSpreadsheet, FileJson, Download, 
  Users, BookOpen, ChevronRight, Search,
  CheckCircle2, XCircle, UploadCloud, LayoutDashboard, ArrowLeft
} from 'lucide-react';
import { AVATARS } from '../constants';
import * as XLSX from 'xlsx';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'settings'>('users');
  const [users, setUsersList] = useState<User[]>([]);
  const [questions, setQuestionsList] = useState<Question[]>([]);
  const [config, setConfig] = useState<GameConfig>(getGameConfig());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Question Form State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [qForm, setQForm] = useState<Partial<Question>>({ 
    type: 'multiple-choice',
    text: '', 
    options: ['', '', '', ''], 
    correctIndex: 0,
    correctAnswer: ''
  });

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'excel' | 'json' | null>(null);

  // User Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [uForm, setUForm] = useState<Partial<User>>({ name: '', password: '', className: '', isAdmin: false, avatar: AVATARS[0] });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsersList(getUsers());
    setQuestionsList(getQuestions());
    setConfig(getGameConfig());
  };

  // --- LOGIC HANDLERS (Giữ nguyên logic cũ, chỉ thay đổi UI) ---
  const handleDeleteUser = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa người chơi này?')) {
      deleteUser(id);
      refreshData();
    }
  };

  const handleSaveUser = () => {
    if (!uForm.name || !uForm.password) return alert("Vui lòng nhập tên và mật khẩu");

    const newUser: User = {
      id: editingUser ? editingUser.id : Date.now().toString(),
      name: uForm.name,
      password: uForm.password,
      className: uForm.isAdmin ? 'Admin' : (uForm.className || ''),
      isAdmin: !!uForm.isAdmin,
      avatar: uForm.avatar || AVATARS[0],
      levelScores: editingUser ? editingUser.levelScores : {},
      badges: editingUser ? editingUser.badges : [],
      totalScore: editingUser ? editingUser.totalScore : 0
    };

    saveUser(newUser);
    refreshData();
    setEditingUser(null);
    setIsAddingUser(false);
    setUForm({ name: '', password: '', className: '', isAdmin: false, avatar: AVATARS[0] });
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const newQuestions = questions.filter(q => q.id !== id);
      saveQuestions(newQuestions);
      setQuestionsList(newQuestions);
    }
  };

  const handleSaveQuestion = () => {
    if (!qForm.text) return alert("Vui lòng nhập nội dung câu hỏi");
    
    if (qForm.type === 'multiple-choice') {
       if (!qForm.options || qForm.options.some(o => !o)) return alert("Vui lòng nhập đủ đáp án");
    } else if (qForm.type === 'fill-in-blank' || qForm.type === 'short-answer') {
       if (!qForm.correctAnswer) return alert("Vui lòng nhập đáp án đúng");
    } else if (qForm.type === 'drag-drop') {
       if (!qForm.options || qForm.options.length < 2) return alert("Vui lòng nhập ít nhất 2 mục để sắp xếp");
    }

    const newQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : `q${Date.now()}`,
      type: qForm.type as QuestionType,
      text: qForm.text,
      options: (qForm.type === 'multiple-choice' || qForm.type === 'drag-drop') ? qForm.options : undefined,
      correctIndex: qForm.type === 'multiple-choice' ? (qForm.correctIndex || 0) : undefined,
      correctAnswer: (qForm.type === 'fill-in-blank' || qForm.type === 'short-answer') ? qForm.correctAnswer : undefined
    };

    let newQuestionsList: Question[];
    if (editingQuestion) {
      newQuestionsList = questions.map(q => q.id === editingQuestion.id ? newQuestion : q);
    } else {
      newQuestionsList = [...questions, newQuestion];
    }

    saveQuestions(newQuestionsList);
    setQuestionsList(newQuestionsList);
    setEditingQuestion(null);
    setIsAddingQuestion(false);
    setQForm({ type: 'multiple-choice', text: '', options: ['', '', '', ''], correctIndex: 0, correctAnswer: '' });
  };

  const handleImportClick = (type: 'excel' | 'json') => {
    setImportType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (importType === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            const validQuestions = json.filter((q: any) => q.text && q.type);
            const newQuestions = validQuestions.map((q: any, i: number) => ({
              ...q,
              id: `imported_${Date.now()}_${i}`
            }));
            const updated = [...questions, ...newQuestions];
            saveQuestions(updated);
            setQuestionsList(updated);
            alert(`Đã nhập thành công ${newQuestions.length} câu hỏi!`);
          } else {
            alert('File JSON không hợp lệ.');
          }
        } catch (err) {
          alert('Lỗi đọc file JSON');
        }
      };
      reader.readAsText(file);
    } else if (importType === 'excel') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          const newQuestions: Question[] = jsonData.map((row: any, i: number) => {
             const type = row.type || 'multiple-choice';
             const options = [];
             if (row.option1) options.push(String(row.option1));
             if (row.option2) options.push(String(row.option2));
             if (row.option3) options.push(String(row.option3));
             if (row.option4) options.push(String(row.option4));
             
             return {
               id: `excel_${Date.now()}_${i}`,
               type: type as QuestionType,
               text: String(row.text),
               options: options.length > 0 ? options : undefined,
               correctIndex: row.correctIndex !== undefined ? parseInt(row.correctIndex) : undefined,
               correctAnswer: row.correctAnswer ? String(row.correctAnswer) : undefined
             };
          }).filter(q => q.text); 

          const updated = [...questions, ...newQuestions];
          saveQuestions(updated);
          setQuestionsList(updated);
          alert(`Đã nhập thành công ${newQuestions.length} câu hỏi từ Excel!`);

        } catch (err) {
          console.error(err);
          alert('Lỗi đọc file Excel.');
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const downloadTemplate = () => {
     const templateData = [
       { text: "Câu hỏi trắc nghiệm mẫu", type: "multiple-choice", option1: "A", option2: "B", option3: "C", option4: "D", correctIndex: 0, correctAnswer: "" },
       { text: "Câu hỏi điền từ mẫu", type: "fill-in-blank", option1: "", option2: "", option3: "", option4: "", correctIndex: "", correctAnswer: "đáp án" }
     ];
     const ws = XLSX.utils.json_to_sheet(templateData);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, "Mau_Cau_Hoi");
     XLSX.writeFile(wb, "mau_nhap_cau_hoi.xlsx");
  };

  const handleSaveConfig = () => {
     saveGameConfig(config);
     alert("Đã lưu cấu hình trò chơi!");
  };

  // --- UI COMPONENTS ---

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-6 py-3 font-bold rounded-t-xl transition-all
        ${activeTab === id 
          ? 'bg-white text-primary border-t-2 border-x-2 border-amber-200 shadow-[0_4px_0_white]' 
          : 'bg-amber-100/50 text-gray-500 hover:bg-amber-100 border-transparent'}
      `}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-amber-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-primary text-white p-3 rounded-xl shadow-lg">
                <LayoutDashboard size={32} />
             </div>
             <div>
               <h1 className="text-3xl font-display font-bold text-primary">Quản Trị Hệ Thống</h1>
               <p className="text-gray-500">Quản lý người chơi, câu hỏi và cài đặt</p>
             </div>
          </div>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 bg-white">
             <ArrowLeft size={18} /> Quay lại trang chủ
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-amber-200 mb-6 px-4">
           <TabButton id="users" label="Người chơi" icon={Users} />
           <TabButton id="questions" label="Ngân hàng câu hỏi" icon={BookOpen} />
           <TabButton id="settings" label="Cấu hình" icon={Settings} />
        </div>

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="animate-[fadeIn_0.3s]">
             <div className="flex justify-between items-center mb-6">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Tìm kiếm người chơi..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-primary outline-none w-64"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
                <Button onClick={() => { setIsAddingUser(true); setEditingUser(null); setUForm({ name: '', password: '', className: '', isAdmin: false, avatar: AVATARS[0] }); }} variant="success" className="shadow-lg transform hover:-translate-y-0.5">
                  <Plus size={18} className="mr-2 inline" /> Thêm người chơi
                </Button>
             </div>
             
             {/* User Form Modal/Card */}
             {(isAddingUser || editingUser) && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-amber-100 mb-8 animate-in slide-in-from-top-4">
                  <h3 className="font-bold text-xl mb-6 text-primary flex items-center gap-2 pb-2 border-b">
                    {editingUser ? <Edit3 size={20}/> : <Plus size={20}/>}
                    {editingUser ? 'Chỉnh sửa thông tin' : 'Thêm người chơi mới'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                     <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Tên đăng nhập</label>
                           <input className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={uForm.name} onChange={e => setUForm({...uForm, name: e.target.value})} placeholder="Nhập tên..." />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
                           <input className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={uForm.password} onChange={e => setUForm({...uForm, password: e.target.value})} placeholder="******" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Lớp</label>
                           <input className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={uForm.className} disabled={!!uForm.isAdmin} onChange={e => setUForm({...uForm, className: e.target.value})} placeholder="VD: 5A" />
                        </div>
                        <div className="flex items-center pt-6">
                           <label className="flex items-center cursor-pointer gap-2 p-3 bg-amber-50 rounded-lg w-full border hover:border-amber-300 transition">
                              <input type="checkbox" checked={!!uForm.isAdmin} onChange={e => setUForm({...uForm, isAdmin: e.target.checked, className: e.target.checked ? 'Admin' : ''})} className="w-5 h-5 accent-primary" />
                              <span className="font-bold text-gray-700">Quyền Admin</span>
                           </label>
                        </div>
                     </div>
                     <div className="lg:col-span-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Avatar</label>
                        <div className="grid grid-cols-3 gap-2">
                          {AVATARS.map((avt, i) => (
                             <img key={i} src={avt} className={`w-14 h-14 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${uForm.avatar === avt ? 'border-primary ring-2 ring-primary/30' : 'border-transparent bg-gray-100'}`} onClick={() => setUForm({...uForm, avatar: avt})} />
                          ))}
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                      <Button variant="secondary" onClick={() => { setIsAddingUser(false); setEditingUser(null); }}>Hủy bỏ</Button>
                      <Button variant="primary" onClick={handleSaveUser}><Save size={18} className="mr-2 inline"/> Lưu thay đổi</Button>
                  </div>
                </div>
             )}

            <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-amber-50 text-amber-900 border-b border-amber-200">
                  <tr>
                    <th className="p-4 font-bold">Người chơi</th>
                    <th className="p-4 font-bold">Thông tin</th>
                    <th className="p-4 font-bold">Thành tích</th>
                    <th className="p-4 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                    <tr key={user.id} className="hover:bg-amber-50/50 transition-colors group">
                      <td className="p-4">
                          <div className="flex items-center gap-3">
                             <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
                             <div>
                                <div className="font-bold text-gray-800">{user.name}</div>
                                {user.isAdmin && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Admin</span>}
                             </div>
                          </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                          <div><span className="font-semibold">Lớp:</span> {user.className || 'N/A'}</div>
                          <div className="font-mono text-xs mt-1">Pass: {user.password}</div>
                      </td>
                      <td className="p-4">
                          <div className="font-bold text-primary">{user.totalScore} điểm</div>
                          <div className="text-xs text-gray-500">{Object.keys(user.levelScores).length} vòng đã chơi</div>
                      </td>
                      <td className="p-4 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingUser(user); setUForm(user); setIsAddingUser(false); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit3 size={18} /></button>
                            {!user.isAdmin && (
                              <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- QUESTIONS TAB --- */}
        {activeTab === 'questions' && (
          <div className="animate-[fadeIn_0.3s]">
             {/* Toolbar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                   <input type="file" ref={fileInputRef} className="hidden" accept={importType === 'excel' ? ".xlsx, .xls" : ".json"} onChange={handleFileChange} />
                   
                   <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => handleImportClick('excel')} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white hover:shadow-sm text-sm font-medium text-green-700 transition">
                         <FileSpreadsheet size={16} /> Excel
                      </button>
                      <button onClick={() => handleImportClick('json')} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white hover:shadow-sm text-sm font-medium text-orange-700 transition">
                         <FileJson size={16} /> JSON
                      </button>
                   </div>
                   <button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-amber-50 text-sm font-medium text-gray-600 border border-transparent hover:border-amber-200 transition">
                      <Download size={16} /> Mẫu
                   </button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <Button onClick={() => { setIsAddingQuestion(true); setEditingQuestion(null); setQForm({ type: 'multiple-choice', text: '', options: ['', '', '', ''], correctIndex: 0, correctAnswer: '' }); }} variant="success" className="w-full md:w-auto shadow-md">
                     <Plus size={18} className="mr-2 inline" /> Tạo câu hỏi
                   </Button>
                </div>
             </div>

             {/* Question Editor */}
             {(isAddingQuestion || editingQuestion) && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-amber-100 mb-8 animate-in slide-in-from-top-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <h3 className="font-bold text-xl mb-6 text-primary flex items-center gap-2">
                    {editingQuestion ? '✏️ Chỉnh sửa câu hỏi' : '✨ Tạo câu hỏi mới'}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Left Column: Question Settings */}
                     <div className="space-y-4">
                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Loại câu hỏi</label>
                          <select 
                              className="w-full p-3 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                              value={qForm.type}
                              onChange={(e) => setQForm({...qForm, type: e.target.value as QuestionType})}
                          >
                              <option value="multiple-choice">🅰️ Trắc nghiệm (4 đáp án)</option>
                              <option value="fill-in-blank">✍️ Điền từ (Điền khuyết)</option>
                              <option value="short-answer">💬 Trả lời ngắn</option>
                              <option value="drag-drop">🔃 Kéo thả (Sắp xếp)</option>
                          </select>
                        </div>
                        
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung câu hỏi</label>
                           <textarea 
                              className="w-full p-4 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none min-h-[120px] text-lg"
                              placeholder="Nhập câu hỏi tại đây..."
                              value={qForm.text}
                              onChange={e => setQForm({...qForm, text: e.target.value})}
                           />
                        </div>
                     </div>

                     {/* Right Column: Answers */}
                     <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                           {qForm.type === 'drag-drop' ? 'Cấu hình thứ tự đúng' : 'Cấu hình đáp án'}
                        </label>

                        {qForm.type === 'multiple-choice' && (
                          <div className="space-y-3">
                            {qForm.options?.map((opt, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${qForm.correctIndex === idx ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                <input 
                                  type="radio" 
                                  name="correct" 
                                  checked={qForm.correctIndex === idx}
                                  onChange={() => setQForm({...qForm, correctIndex: idx})}
                                  className="w-5 h-5 accent-green-600 cursor-pointer"
                                />
                                <input 
                                  className="w-full bg-transparent outline-none font-medium"
                                  placeholder={`Nhập đáp án ${idx + 1}...`}
                                  value={opt}
                                  onChange={e => {
                                     const newOpts = [...(qForm.options || [])];
                                     newOpts[idx] = e.target.value;
                                     setQForm({...qForm, options: newOpts});
                                  }}
                                />
                                {qForm.correctIndex === idx && <CheckCircle2 size={18} className="text-green-600"/>}
                              </div>
                            ))}
                          </div>
                        )}

                        {(qForm.type === 'fill-in-blank' || qForm.type === 'short-answer') && (
                           <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <label className="block text-xs font-bold text-gray-500 mb-1">ĐÁP ÁN CHÍNH XÁC</label>
                              <input 
                                className="w-full p-2 border-b-2 border-primary outline-none text-lg font-bold text-primary bg-transparent"
                                placeholder="Nhập đáp án đúng..."
                                value={qForm.correctAnswer}
                                onChange={e => setQForm({...qForm, correctAnswer: e.target.value})}
                              />
                              <p className="text-xs text-gray-500 mt-2 italic flex items-center gap-1">
                                 <CheckCircle2 size={12}/> Hệ thống tự động bỏ qua viết hoa/thường.
                              </p>
                           </div>
                        )}

                        {qForm.type === 'drag-drop' && (
                           <div className="space-y-2">
                              {qForm.options?.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                   <span className="w-8 h-10 flex items-center justify-center bg-gray-200 rounded font-bold text-gray-600">{idx+1}</span>
                                   <div className="flex-1 flex items-center bg-white border rounded px-3">
                                      <input 
                                         className="w-full outline-none"
                                         value={opt}
                                         placeholder={`Mục thứ ${idx+1}`}
                                         onChange={e => {
                                            const newOpts = [...(qForm.options || [])];
                                            newOpts[idx] = e.target.value;
                                            setQForm({...qForm, options: newOpts});
                                         }}
                                      />
                                      <button onClick={() => { const newOpts = (qForm.options || []).filter((_, i) => i !== idx); setQForm({...qForm, options: newOpts}); }} className="text-gray-400 hover:text-red-500"><XCircle size={16}/></button>
                                   </div>
                                </div>
                              ))}
                              <button onClick={() => setQForm({...qForm, options: [...(qForm.options || []), '']})} className="text-sm font-bold text-primary hover:underline ml-10">+ Thêm mục</button>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                      <Button variant="secondary" onClick={() => { setIsAddingQuestion(false); setEditingQuestion(null); }}>Hủy bỏ</Button>
                      <Button variant="primary" onClick={handleSaveQuestion}><Save size={18} className="mr-2 inline"/> Lưu câu hỏi</Button>
                  </div>
                </div>
             )}

             {/* Question List */}
             <div className="grid grid-cols-1 gap-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-primary/50 shadow-sm hover:shadow-md transition-all">
                     <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                           <div className="bg-amber-100 text-amber-800 font-bold w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                              {idx + 1}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase
                                    ${q.type === 'multiple-choice' ? 'bg-blue-100 text-blue-700' : 
                                      q.type === 'drag-drop' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {q.type}
                                 </span>
                              </div>
                              <p className="font-medium text-gray-800 text-lg line-clamp-2">{q.text}</p>
                              <div className="mt-2 text-sm text-gray-500">
                                 {q.type === 'multiple-choice' && <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> Đáp án: {q.options?.[q.correctIndex || 0]}</span>}
                                 {(q.type === 'fill-in-blank' || q.type === 'short-answer') && <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> Đáp án: {q.correctAnswer}</span>}
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditingQuestion(q); setQForm(q); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={20}/></button>
                           <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
           <div className="max-w-2xl mx-auto animate-[fadeIn_0.3s]">
              <div className="bg-white rounded-xl shadow-xl border border-amber-200 overflow-hidden">
                 <div className="bg-amber-50 p-6 border-b border-amber-200">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                       <Settings className="animate-spin-slow" /> Cấu hình Trò chơi
                    </h2>
                    <p className="text-gray-600 mt-1">Điều chỉnh các thông số cơ bản của hệ thống</p>
                 </div>
                 
                 <div className="p-8 space-y-8">
                    <div className="space-y-6">
                       <div className="group">
                          <label className="block text-gray-700 font-bold mb-2 flex items-center justify-between">
                             <span>Tổng số Vòng chơi (Levels)</span>
                             <span className="bg-primary text-white text-xs px-2 py-1 rounded">{config.totalLevels}</span>
                          </label>
                          <input 
                             type="range" min="1" max="20"
                             className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                             value={config.totalLevels}
                             onChange={(e) => setConfig({...config, totalLevels: parseInt(e.target.value) || 1})}
                          />
                          <p className="text-xs text-gray-400 mt-2">Kéo để điều chỉnh số lượng cấp độ hiển thị trên bản đồ.</p>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-gray-700 font-bold mb-2">Câu hỏi / Vòng</label>
                              <div className="relative">
                                 <input 
                                    type="number" 
                                    className="w-full p-3 pl-4 border rounded-lg text-lg font-mono focus:ring-2 focus:ring-primary outline-none"
                                    value={config.questionsPerLevel}
                                    onChange={(e) => setConfig({...config, questionsPerLevel: parseInt(e.target.value) || 1})}
                                 />
                                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">câu</span>
                              </div>
                          </div>
                          <div>
                              <label className="block text-gray-700 font-bold mb-2">Điểm qua màn</label>
                              <div className="relative">
                                 <input 
                                    type="number" 
                                    className="w-full p-3 pl-4 border rounded-lg text-lg font-mono focus:ring-2 focus:ring-primary outline-none"
                                    value={config.passScore}
                                    onChange={(e) => setConfig({...config, passScore: parseInt(e.target.value) || 0})}
                                 />
                                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">điểm</span>
                              </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                       <Button fullWidth onClick={handleSaveConfig} className="py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                          <Save size={20} className="mr-2 inline"/> Lưu Cấu Hình Hệ Thống
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};