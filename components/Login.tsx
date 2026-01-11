import React, { useState } from 'react';
import { AVATARS } from '../constants';
import { Button } from './Button';
import { User } from '../types';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: Partial<User>, isRegister: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [className, setClassName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;
    
    onLogin({
      name,
      password,
      className: isAdmin ? 'Admin' : className,
      avatar: selectedAvatar,
      isAdmin
    }, isRegister);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-amber-200">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Sử Việt Tranh Tài</h1>
          <p className="text-gray-600">Khám phá lịch sử hào hùng dân tộc</p>
        </div>

        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button 
            className={`pb-2 px-4 font-bold ${!isRegister ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setIsRegister(false)}
          >
            Đăng Nhập
          </button>
          <button 
            className={`pb-2 px-4 font-bold ${isRegister ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
            onClick={() => setIsRegister(true)}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Nhập tên của bạn..."
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
             <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="******"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
             </div>
          </div>

          {isRegister && !isAdmin && (
             <div className="animate-[fadeIn_0.3s]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
              <input 
                type="text" 
                required={isRegister && !isAdmin}
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ví dụ: 5A"
              />
            </div>
          )}

          {isRegister && (
            <div className="animate-[fadeIn_0.3s]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nhân vật</label>
              <div className="grid grid-cols-3 gap-3">
                {AVATARS.map((avt, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedAvatar(avt)}
                    className={`cursor-pointer rounded-full p-1 border-2 transition-all transform hover:scale-105 ${selectedAvatar === avt ? 'border-primary bg-amber-100 scale-105' : 'border-transparent'}`}
                  >
                    <img src={avt} alt={`Avatar ${idx}`} className="w-full h-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
             <input type="checkbox" id="admin-mode" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} className="rounded text-primary focus:ring-primary"/>
             <label htmlFor="admin-mode" className="text-sm text-gray-500 cursor-pointer">
                {isRegister ? 'Đăng ký' : 'Đăng nhập'} với quyền Giáo viên/Admin
             </label>
          </div>

          <Button type="submit" fullWidth className="text-lg py-3 mt-4">
            {isRegister ? 'Đăng Ký Ngay' : 'Vào Game'}
          </Button>
        </form>
      </div>
    </div>
  );
};