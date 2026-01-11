import React, { useState, useEffect } from 'react';
import { User, Question, GameConfig, QuestionType } from '../types';
import { getUsers, getQuestions, getGameConfig, saveUsers, saveQuestions, saveGameConfig, deleteUser, saveUser } from '../services/storage';
import { Button } from './Button';
import { Trash2, Edit2, Plus, Save, Settings, GripVertical } from 'lucide-react';
import { AVATARS } from '../constants';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'settings'>('users');
  const [users, setUsersList] = useState<User[]>([]);
  const [questions, setQuestionsList] = useState<Question[]>([]);
  const [config, setConfig] = useState<GameConfig>(getGameConfig());
  
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

  // --- USER HANDLERS ---
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

  // --- QUESTION HANDLERS ---
  const handleDeleteQuestion = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const newQuestions = questions.filter(q => q.id !== id);
      saveQuestions(newQuestions);
      setQuestionsList(newQuestions);
    }
  };

  const handleSaveQuestion = () => {
    if (!qForm.text) return alert("Vui lòng nhập nội dung câu hỏi");
    
    // Validation based on type
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
    // Reset form
    setQForm({ type: 'multiple-choice', text: '', options: ['', '', '', ''], correctIndex: 0, correctAnswer: '' });
  };

  // --- CONFIG HANDLERS ---
  const handleSaveConfig = () => {
     saveGameConfig(config);
     alert("Đã lưu cấu hình trò chơi!");
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 max-w-6xl mx-auto min-h-[80vh]">
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-amber-200">
        <h2 className="text-3xl font-display text-primary">Quản Trị Hệ Thống</h2>
        <Button onClick={onBack} variant="outline">Quay lại</Button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <Button 
          variant={activeTab === 'users' ? 'primary' : 'outline'} 
          onClick={() => setActiveTab('users')}
        >
          Người chơi
        </Button>
        <Button 
          variant={activeTab === 'questions' ? 'primary' : 'outline'} 
          onClick={() => setActiveTab('questions')}
        >
          Ngân hàng câu hỏi
        </Button>
        <Button 
          variant={activeTab === 'settings' ? 'primary' : 'outline'} 
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} className="mr-2 inline" /> Cấu hình Vòng chơi
        </Button>
      </div>

      {activeTab === 'users' ? (
        <div>
           <div className="flex justify-end mb-4">
              <Button onClick={() => { setIsAddingUser(true); setEditingUser(null); setUForm({ name: '', password: '', className: '', isAdmin: false, avatar: AVATARS[0] }); }} variant="success">
                <Plus size={18} className="mr-2 inline" /> Thêm người chơi
              </Button>
           </div>
           
           {(isAddingUser || editingUser) && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                <h3 className="font-bold text-lg mb-4 text-primary">{editingUser ? 'Sửa người chơi' : 'Thêm người chơi mới'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* ... User Form Fields ... */}
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Tên đăng nhập</label>
                      <input 
                        className="w-full p-2 border rounded mt-1" 
                        value={uForm.name} 
                        onChange={e => setUForm({...uForm, name: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                      <input 
                        className="w-full p-2 border rounded mt-1" 
                        value={uForm.password} 
                        onChange={e => setUForm({...uForm, password: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Lớp</label>
                      <input 
                        className="w-full p-2 border rounded mt-1" 
                        value={uForm.className} 
                        disabled={!!uForm.isAdmin}
                        onChange={e => setUForm({...uForm, className: e.target.value})}
                      />
                   </div>
                   <div className="flex items-center mt-6">
                      <input 
                        type="checkbox" 
                        checked={!!uForm.isAdmin} 
                        onChange={e => setUForm({...uForm, isAdmin: e.target.checked, className: e.target.checked ? 'Admin' : ''})} 
                        className="w-5 h-5 text-primary"
                      />
                      <label className="ml-2 font-bold text-gray-700">Là Quản trị viên (Admin)</label>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Avatar</label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {AVATARS.map((avt, i) => (
                           <img 
                              key={i} 
                              src={avt} 
                              className={`w-12 h-12 rounded-full cursor-pointer border-2 ${uForm.avatar === avt ? 'border-primary' : 'border-transparent'}`}
                              onClick={() => setUForm({...uForm, avatar: avt})}
                           />
                        ))}
                      </div>
                   </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => { setIsAddingUser(false); setEditingUser(null); }}>Hủy</Button>
                    <Button variant="primary" onClick={handleSaveUser}><Save size={18} className="mr-2 inline"/> Lưu</Button>
                </div>
              </div>
           )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100 text-primary">
                  <th className="p-3 rounded-tl-lg">Tên</th>
                  <th className="p-3">Mật khẩu</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Điểm tổng</th>
                  <th className="p-3 rounded-tr-lg text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-amber-50 hover:bg-amber-50">
                    <td className="p-3 font-medium flex items-center gap-2">
                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                        {user.name} {user.isAdmin && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Admin</span>}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-sm">{user.password || '---'}</td>
                    <td className="p-3">{user.className}</td>
                    <td className="p-3">{user.totalScore}</td>
                    <td className="p-3 text-right">
                       <button onClick={() => { setEditingUser(user); setUForm(user); setIsAddingUser(false); }} className="text-blue-500 hover:text-blue-700 p-2 mr-1">
                          <Edit2 size={20} />
                       </button>
                      {!user.isAdmin && (
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'questions' ? (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setIsAddingQuestion(true); setEditingQuestion(null); setQForm({ type: 'multiple-choice', text: '', options: ['', '', '', ''], correctIndex: 0, correctAnswer: '' }); }} variant="success">
              <Plus size={18} className="mr-2 inline" /> Thêm câu hỏi
            </Button>
          </div>

          {(isAddingQuestion || editingQuestion) && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
              <h3 className="font-bold text-lg mb-2 text-primary">{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
              
              <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700">Loại câu hỏi</label>
                   <select 
                      className="w-full p-2 border rounded mt-1"
                      value={qForm.type}
                      onChange={(e) => setQForm({...qForm, type: e.target.value as QuestionType})}
                   >
                      <option value="multiple-choice">Trắc nghiệm (4 đáp án)</option>
                      <option value="fill-in-blank">Điền từ (Điền khuyết)</option>
                      <option value="short-answer">Trả lời ngắn</option>
                      <option value="drag-drop">Kéo thả (Sắp xếp)</option>
                   </select>
                </div>

                <input 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Nội dung câu hỏi"
                  value={qForm.text}
                  onChange={e => setQForm({...qForm, text: e.target.value})}
                />

                {qForm.type === 'multiple-choice' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {qForm.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="correct" 
                          checked={qForm.correctIndex === idx}
                          onChange={() => setQForm({...qForm, correctIndex: idx})}
                          className="w-4 h-4 accent-primary"
                        />
                        <input 
                          className="w-full p-2 border rounded text-sm"
                          placeholder={`Đáp án ${idx + 1}`}
                          value={opt}
                          onChange={e => {
                             const newOpts = [...(qForm.options || [])];
                             newOpts[idx] = e.target.value;
                             setQForm({...qForm, options: newOpts});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {(qForm.type === 'fill-in-blank' || qForm.type === 'short-answer') && (
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Đáp án đúng (Chính xác từng chữ)</label>
                      <input 
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Nhập đáp án..."
                        value={qForm.correctAnswer}
                        onChange={e => setQForm({...qForm, correctAnswer: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Hệ thống sẽ tự động bỏ qua viết hoa/thường và khoảng trắng thừa khi chấm.</p>
                   </div>
                )}

                {qForm.type === 'drag-drop' && (
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nhập các mục theo đúng thứ tự (Từ trên xuống dưới)</label>
                      {qForm.options?.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                           <span className="w-6 text-center font-bold">{idx+1}.</span>
                           <input 
                              className="w-full p-2 border rounded"
                              value={opt}
                              onChange={e => {
                                 const newOpts = [...(qForm.options || [])];
                                 newOpts[idx] = e.target.value;
                                 setQForm({...qForm, options: newOpts});
                              }}
                           />
                           <button 
                              onClick={() => {
                                 const newOpts = (qForm.options || []).filter((_, i) => i !== idx);
                                 setQForm({...qForm, options: newOpts});
                              }}
                              className="text-red-500"
                           >
                              <X size={18}/>
                           </button>
                        </div>
                      ))}
                      <Button 
                         variant="outline" 
                         onClick={() => setQForm({...qForm, options: [...(qForm.options || []), '']})}
                         className="mt-2 text-sm"
                      >
                         + Thêm mục
                      </Button>
                   </div>
                )}

                <div className="flex justify-end gap-2 mt-2">
                   <Button variant="secondary" onClick={() => { setIsAddingQuestion(false); setEditingQuestion(null); }}>Hủy</Button>
                   <Button variant="primary" onClick={handleSaveQuestion}><Save size={18} className="mr-2 inline"/> Lưu</Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
             {questions.map((q, idx) => (
               <div key={q.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start">
                  <div>
                    <span className="font-bold text-amber-700 mr-2">#{idx + 1}</span>
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700 mr-2">
                       {q.type === 'multiple-choice' ? 'Trắc nghiệm' : 
                        q.type === 'drag-drop' ? 'Kéo thả' : 
                        q.type === 'fill-in-blank' ? 'Điền từ' : 'Trả lời ngắn'}
                    </span>
                    <span className="font-medium">{q.text}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingQuestion(q); setQForm(q); }} className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Edit2 size={18}/></button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
         <div className="max-w-xl mx-auto">
             {/* ... Settings Tab Content (Same as before) ... */}
            <h3 className="text-xl font-bold mb-6 text-primary border-b pb-2">Cấu hình Vòng chơi & Luật chơi</h3>
            <div className="space-y-6">
               <div>
                  <label className="block text-gray-700 font-bold mb-2">Tổng số Cấp độ (Vòng chơi)</label>
                  <input 
                     type="number" 
                     className="w-full p-3 border rounded-lg text-lg"
                     value={config.totalLevels}
                     onChange={(e) => setConfig({...config, totalLevels: parseInt(e.target.value) || 1})}
                     min="1" max="20"
                  />
                  <p className="text-sm text-gray-500 mt-1">Số lượng vòng chơi hiển thị trên bản đồ.</p>
               </div>
               
               <div>
                  <label className="block text-gray-700 font-bold mb-2">Số câu hỏi mỗi vòng</label>
                  <input 
                     type="number" 
                     className="w-full p-3 border rounded-lg text-lg"
                     value={config.questionsPerLevel}
                     onChange={(e) => setConfig({...config, questionsPerLevel: parseInt(e.target.value) || 1})}
                     min="1" max="50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Hệ thống sẽ lấy ngẫu nhiên số lượng câu này từ ngân hàng câu hỏi.</p>
               </div>

               <div>
                  <label className="block text-gray-700 font-bold mb-2">Điểm cần đạt để qua vòng</label>
                  <input 
                     type="number" 
                     className="w-full p-3 border rounded-lg text-lg"
                     value={config.passScore}
                     onChange={(e) => setConfig({...config, passScore: parseInt(e.target.value) || 0})}
                     min="0" max={config.questionsPerLevel}
                  />
                  <p className="text-sm text-gray-500 mt-1">Người chơi cần đạt điểm lớn hơn số này (ví dụ: &gt; 5 điểm).</p>
               </div>

               <div className="pt-4">
                  <Button fullWidth onClick={handleSaveConfig} className="py-3 text-lg">
                     <Save size={20} className="mr-2 inline"/> Lưu Cấu Hình
                  </Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// Helper X Icon
const X = ({size}: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);