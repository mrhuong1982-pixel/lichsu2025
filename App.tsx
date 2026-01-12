import React, { useState, useEffect } from 'react';
import { GameView, User, Question, GameConfig, DEFAULT_CONFIG } from './types';
import { BADGES } from './constants';
import { getUsers, saveUser, getQuestions, setCurrentUserId, getCurrentUserId, getGameConfig } from './services/storage';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Game } from './components/Game';
import { AdminPanel } from './components/AdminPanel';
import { Certificate } from './components/Certificate';

function App() {
  const [view, setView] = useState<GameView>(GameView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  // Load session
  useEffect(() => {
    // Load config
    setConfig(getGameConfig());

    const savedId = getCurrentUserId();
    if (savedId) {
      const users = getUsers();
      const user = users.find(u => u.id === savedId);
      if (user) {
        setCurrentUser(user);
        setView(user.isAdmin ? GameView.ADMIN : GameView.DASHBOARD);
      }
    }
    setQuestions(getQuestions());
  }, []);

  const handleLogin = (userData: Partial<User>, isRegister: boolean) => {
    const users = getUsers();
    
    if (isRegister) {
       // Check if name exists
       if (users.some(u => u.name === userData.name)) {
         alert('Tên người chơi đã tồn tại. Vui lòng chọn tên khác.');
         return;
       }

       const newUser: User = {
        id: Date.now().toString(),
        name: userData.name!,
        password: userData.password,
        className: userData.className || '',
        avatar: userData.avatar!,
        isAdmin: !!userData.isAdmin,
        levelScores: {},
        badges: [],
        totalScore: 0,
      };
      saveUser(newUser);
      setCurrentUser(newUser);
      setCurrentUserId(newUser.id);
      setView(newUser.isAdmin ? GameView.ADMIN : GameView.DASHBOARD);

    } else {
      // Login
      const user = users.find(u => u.name === userData.name && u.isAdmin === userData.isAdmin);
      
      if (!user) {
        alert('Không tìm thấy tài khoản. Vui lòng kiểm tra lại tên hoặc đăng ký mới.');
        return;
      }

      if (user.password && user.password !== userData.password) {
        alert('Mật khẩu không đúng.');
        return;
      }
      
      setCurrentUser(user);
      setCurrentUserId(user.id);
      setView(user.isAdmin ? GameView.ADMIN : GameView.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserId(null);
    setView(GameView.LOGIN);
  };

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    // Reload questions from storage in case admin updated them
    setQuestions(getQuestions());
    // Reload config in case admin updated it
    setConfig(getGameConfig());
    setView(GameView.GAME);
  };

  const handleGameComplete = (score: number) => {
    if (!currentUser) return;

    const newScores = { ...currentUser.levelScores };
    // Keep highest score
    if (!newScores[currentLevel] || score > newScores[currentLevel]) {
      newScores[currentLevel] = score;
    }

    // Calculate total score
    const totalScore = (Object.values(newScores) as number[]).reduce((a: number, b: number) => a + b, 0);

    // Check badges
    const newBadges = [...currentUser.badges];
    BADGES.forEach(badge => {
      if (!newBadges.includes(badge.id) && badge.condition(totalScore)) {
        newBadges.push(badge.id);
        alert(`🎉 Chúc mừng! Bạn nhận được huy hiệu: ${badge.name}`);
      }
    });

    const updatedUser = {
      ...currentUser,
      levelScores: newScores,
      totalScore,
      badges: newBadges
    };

    setCurrentUser(updatedUser);
    saveUser(updatedUser);

    // Check if user just completed the last level
    const allPassed = Array.from({length: config.totalLevels}, (_, i) => i + 1)
       .every(lvl => (newScores[lvl] || 0) > config.passScore);

    // If passed all levels and this was the last level attempt
    if (allPassed && currentLevel === config.totalLevels && score > config.passScore) {
       setView(GameView.CERTIFICATE);
    } else {
       setView(GameView.DASHBOARD);
    }
  };

  // Render Logic
  if (view === GameView.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  if (view === GameView.ADMIN) {
    return <AdminPanel onBack={() => {
        // Reload everything when coming back from admin
        setConfig(getGameConfig());
        setView(GameView.DASHBOARD);
    }} />;
  }

  if (view === GameView.GAME && currentUser) {
    return (
      <div className="min-h-screen py-8 px-4">
        <Game 
          level={currentLevel} 
          questions={questions} 
          onComplete={handleGameComplete}
          onBack={() => setView(GameView.DASHBOARD)}
          config={config}
        />
      </div>
    );
  }

  if (view === GameView.CERTIFICATE && currentUser) {
    return (
      <Certificate 
        user={currentUser} 
        onBack={() => setView(GameView.DASHBOARD)} 
      />
    );
  }

  if (view === GameView.DASHBOARD && currentUser) {
    return (
      <div className="min-h-screen py-8">
         <header className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-primary">Sử Việt Tranh Tài</h1>
         </header>
         <Dashboard 
           currentUser={currentUser} 
           onSelectLevel={handleSelectLevel} 
           onLogout={handleLogout}
           onAdmin={currentUser.isAdmin ? () => setView(GameView.ADMIN) : undefined}
           config={config}
           onViewCertificate={() => setView(GameView.CERTIFICATE)}
         />
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;