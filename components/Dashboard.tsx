import React, { useMemo } from 'react';
import { User, GameConfig } from '../types';
import { BADGES } from '../constants';
import { getUsers } from '../services/storage';
import { Button } from './Button';
import { Lock, Play, Star, Award, LogOut, Trophy, GraduationCap } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onSelectLevel: (level: number) => void;
  onLogout: () => void;
  onAdmin?: () => void;
  config: GameConfig;
  onViewCertificate?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onSelectLevel, onLogout, onAdmin, config, onViewCertificate }) => {
  const users = getUsers();
  
  // Calculate rankings
  const leaderboard = useMemo(() => {
    return [...users]
      .filter(u => !u.isAdmin)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  }, [users]);

  // Determine unlocked levels
  // Level 1 always unlocked. Level N unlocked if Level N-1 score > passScore.
  const isLevelUnlocked = (lvl: number) => {
    if (lvl === 1) return true;
    const prevScore = currentUser.levelScores[lvl - 1];
    return prevScore > config.passScore;
  };

  // Check if all levels are passed
  const isGameCompleted = useMemo(() => {
    return Array.from({ length: config.totalLevels }, (_, i) => i + 1)
      .every(lvl => (currentUser.levelScores[lvl] || 0) > config.passScore);
  }, [currentUser.levelScores, config]);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Sidebar / Profile */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <img src={currentUser.avatar} alt="Avatar" className="w-24 h-24 mx-auto rounded-full bg-amber-100 mb-4 border-4 border-amber-300" />
          <h2 className="text-2xl font-display font-bold text-primary">{currentUser.name}</h2>
          <p className="text-gray-500">Lớp: {currentUser.className}</p>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
             <div className="text-sm text-gray-500">Tổng điểm</div>
             <div className="text-3xl font-bold text-secondary">{currentUser.totalScore}</div>
          </div>
          
          <div className="mt-4 space-y-2">
            {isGameCompleted && (
               <Button fullWidth variant="success" onClick={onViewCertificate} className="flex items-center justify-center gap-2 mb-2 animate-pulse">
                 <GraduationCap size={20}/> Giấy Chứng Nhận
               </Button>
            )}

            {currentUser.isAdmin && (
               <Button fullWidth variant="outline" onClick={onAdmin}>Quản lý (Admin)</Button>
            )}
            <Button fullWidth variant="secondary" onClick={onLogout} className="flex items-center justify-center gap-2">
              <LogOut size={16}/> Đăng xuất
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
            <Award size={20}/> Huy Hiệu
          </h3>
          <div className="grid grid-cols-2 gap-3">
             {BADGES.map(badge => {
                const hasBadge = currentUser.badges.includes(badge.id);
                return (
                  <div key={badge.id} className={`p-2 rounded-lg text-center border ${hasBadge ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}>
                     <div className="text-2xl mb-1">{badge.icon}</div>
                     <div className="text-xs font-bold truncate">{badge.name}</div>
                  </div>
                )
             })}
          </div>
        </div>
      </div>

      {/* Main Content: Map */}
      <div className="lg:col-span-6">
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 min-h-[500px]">
           <h2 className="text-3xl font-display text-center mb-8 text-primary">Bản Đồ Lịch Sử</h2>
           
           <div className="relative flex flex-col items-center gap-6">
              {/* Draw a connecting line behind */}
              <div className="absolute top-0 bottom-0 w-1 bg-amber-200 -z-10 rounded-full"></div>

              {Array.from({ length: config.totalLevels }).map((_, idx) => {
                const level = idx + 1;
                const unlocked = isLevelUnlocked(level);
                const score = currentUser.levelScores[level];
                const passed = score > config.passScore;

                return (
                  <div key={level} className="relative w-full flex justify-center">
                    <button 
                      onClick={() => unlocked && onSelectLevel(level)}
                      disabled={!unlocked}
                      className={`
                        w-64 p-4 rounded-xl border-b-4 transition-all transform hover:-translate-y-1 active:translate-y-0
                        flex items-center justify-between
                        ${unlocked 
                          ? passed 
                             ? 'bg-green-100 border-green-400 hover:bg-green-200' 
                             : 'bg-white border-amber-300 hover:bg-amber-50' 
                          : 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-70'}
                      `}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-xl font-bold ${unlocked ? 'bg-primary text-white' : 'bg-gray-400 text-gray-200'}`}>
                            {level}
                          </div>
                          <div className="text-left">
                             <div className={`font-bold ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>Cấp độ {level}</div>
                             {score !== undefined && <div className="text-xs text-gray-500">Điểm cao nhất: {score}/{config.questionsPerLevel}</div>}
                          </div>
                       </div>
                       
                       {!unlocked ? <Lock size={20} className="text-gray-400"/> : passed ? <Star size={20} className="text-green-500 fill-current"/> : <Play size={20} className="text-primary"/>}
                    </button>
                  </div>
                )
              })}
           </div>
        </div>
      </div>

      {/* Right Sidebar: Leaderboard */}
      <div className="lg:col-span-3">
         <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
              <Trophy size={20}/> Bảng Vinh Danh
            </h3>
            
            <div className="space-y-4">
              {leaderboard.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm 
                    ${idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-md scale-110' : 
                      idx === 1 ? 'bg-gray-300 text-gray-800' : 
                      idx === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {idx + 1}
                  </div>
                  <img src={user.avatar} alt="mini avt" className="w-8 h-8 rounded-full bg-gray-200"/>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-gray-500">Lớp {user.className}</div>
                  </div>
                  <div className="font-bold text-primary">{user.totalScore}đ</div>
                </div>
              ))}
              {leaderboard.length === 0 && <p className="text-sm text-gray-400 text-center">Chưa có dữ liệu</p>}
            </div>
         </div>
      </div>
    </div>
  );
};