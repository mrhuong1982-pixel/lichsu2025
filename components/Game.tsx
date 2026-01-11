import React, { useState, useEffect, useRef } from 'react';
import { Question, GameConfig } from '../types';
import { Button } from './Button';
import { CheckCircle, XCircle, Trophy, ArrowRight, X, GripVertical } from 'lucide-react';

interface GameProps {
  level: number;
  questions: Question[];
  onComplete: (score: number) => void;
  onBack: () => void;
  config: GameConfig;
}

export const Game: React.FC<GameProps> = ({ level, questions, onComplete, onBack, config }) => {
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Game State
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // State for different answer types
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // For MC
  const [textAnswer, setTextAnswer] = useState(''); // For Fill/Short
  const [dragItems, setDragItems] = useState<string[]>([]); // For Drag Drop
  const [isCorrect, setIsCorrect] = useState(false);

  // Initialize Game
  useEffect(() => {
    // Shuffle and pick
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, config.questionsPerLevel);
    setGameQuestions(selected);
  }, [questions, config.questionsPerLevel]);

  // Reset state when question changes
  useEffect(() => {
    if (gameQuestions.length > 0 && currentIndex < gameQuestions.length) {
      const q = gameQuestions[currentIndex];
      setSelectedOption(null);
      setTextAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
      
      if (q.type === 'drag-drop' && q.options) {
        // Shuffle options for drag drop initially
        setDragItems([...q.options].sort(() => 0.5 - Math.random()));
      }
    }
  }, [currentIndex, gameQuestions]);

  const handleMCAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    const correct = index === gameQuestions[currentIndex].correctIndex;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const checkTextAnswer = () => {
    if (!textAnswer.trim()) return;
    setIsAnswered(true);
    const q = gameQuestions[currentIndex];
    // Normalize string: lowercase, trim, remove extra spaces
    const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
    const correct = normalize(textAnswer) === normalize(q.correctAnswer || '');
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const checkDragAnswer = () => {
    setIsAnswered(true);
    const q = gameQuestions[currentIndex];
    // Compare current dragItems order with original q.options (which is assumed correct order in data)
    const currentString = JSON.stringify(dragItems);
    const correctString = JSON.stringify(q.options);
    const correct = currentString === correctString;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  // Drag and Drop Handlers
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const copyListItems = [...dragItems];
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setDragItems(copyListItems);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < gameQuestions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (gameQuestions.length === 0) return <div className="text-center p-8">Đang tải câu hỏi...</div>;

  if (isFinished) {
    const passed = score > config.passScore;
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-lg mx-auto text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="mb-6 flex justify-center">
          {passed ? (
             <div className="bg-yellow-100 p-6 rounded-full">
                <Trophy size={64} className="text-yellow-600 animate-bounce" />
             </div>
          ) : (
            <div className="bg-gray-100 p-6 rounded-full">
               <XCircle size={64} className="text-gray-500" />
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-display font-bold text-primary mb-2">
          {passed ? 'Chúc mừng!' : 'Rất tiếc!'}
        </h2>
        <p className="text-xl mb-6">
          Bạn đạt được <span className="font-bold text-2xl text-secondary">{score}</span>/{config.questionsPerLevel} điểm
        </p>
        <Button fullWidth onClick={() => onComplete(score)} className="text-lg py-3">
          {passed ? 'Nhận thưởng & Tiếp tục' : 'Quay về Danh sách'}
        </Button>
      </div>
    );
  }

  const currentQ = gameQuestions[currentIndex];

  // Render content based on type
  const renderContent = () => {
    switch (currentQ.type) {
      case 'multiple-choice':
        return (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options?.map((option, idx) => {
              let btnClass = "text-left p-4 rounded-xl border-2 transition-all duration-200 hover:bg-amber-50 relative ";
              if (isAnswered) {
                if (idx === currentQ.correctIndex) btnClass += "border-green-500 bg-green-50 text-green-800 ";
                else if (idx === selectedOption) btnClass += "border-red-500 bg-red-50 text-red-800 ";
                else btnClass += "border-gray-200 opacity-50 ";
              } else {
                btnClass += "border-gray-200 hover:border-amber-300 cursor-pointer ";
              }
              return (
                <button key={idx} onClick={() => handleMCAnswer(idx)} disabled={isAnswered} className={btnClass}>
                  <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>{option}
                  {isAnswered && idx === currentQ.correctIndex && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />}
                </button>
              );
            })}
          </div>
        );

      case 'fill-in-blank':
      case 'short-answer':
        return (
          <div className="space-y-4">
             {currentQ.type === 'fill-in-blank' && (
               <div className="text-gray-500 italic mb-2 text-sm">Điền từ còn thiếu vào chỗ trống (...)</div>
             )}
             <input 
                type="text"
                value={textAnswer}
                onChange={e => setTextAnswer(e.target.value)}
                disabled={isAnswered}
                placeholder="Nhập câu trả lời của bạn..."
                className={`w-full p-4 text-lg border-2 rounded-xl outline-none transition-colors 
                  ${isAnswered 
                    ? isCorrect ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-300 focus:border-primary'
                  }`}
             />
             {isAnswered && (
               <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isCorrect ? 'Chính xác!' : `Sai rồi! Đáp án đúng là: ${currentQ.correctAnswer}`}
               </div>
             )}
             {!isAnswered && (
               <Button onClick={checkTextAnswer} disabled={!textAnswer.trim()} className="mt-2">
                 Trả lời
               </Button>
             )}
          </div>
        );

      case 'drag-drop':
        return (
          <div className="space-y-4">
             <div className="text-gray-500 italic mb-2 text-sm">Kéo thả các mục để sắp xếp theo đúng thứ tự</div>
             <div className="space-y-2">
                {dragItems.map((item, index) => (
                  <div
                    key={index}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    draggable={!isAnswered}
                    className={`p-4 bg-white border-2 rounded-xl flex items-center gap-3 cursor-move shadow-sm transition-colors
                      ${isAnswered 
                         ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                         : 'border-amber-200 hover:border-amber-400'
                      }`}
                  >
                     <GripVertical className="text-gray-400" />
                     <span className="font-medium">{item}</span>
                  </div>
                ))}
             </div>
             {isAnswered && (
               <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isCorrect ? 'Chính xác!' : 'Chưa chính xác. Hãy thử lại lần sau!'}
               </div>
             )}
             {!isAnswered && (
               <Button onClick={checkDragAnswer} className="mt-2">
                 Kiểm tra
               </Button>
             )}
          </div>
        );
      
      default:
        return <div>Unsupported type</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <div className="font-display text-xl">Cấp độ {level}</div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            Điểm: {score}
          </div>
          <button onClick={onBack} className="text-white/80 hover:text-white"><X size={20}/></button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <div 
            className="bg-secondary h-2 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / config.questionsPerLevel) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-2 text-sm text-gray-500 font-bold uppercase tracking-wider">
            Câu hỏi {currentIndex + 1}/{config.questionsPerLevel}
          </div>
          
          <h3 className="text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
            {currentQ.text}
          </h3>

          {renderContent()}

          <div className="mt-8 h-12 flex justify-end">
            {isAnswered && (
              <Button onClick={nextQuestion} className="flex items-center gap-2 animate-[fadeIn_0.3s]">
                {currentIndex === config.questionsPerLevel - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                <ArrowRight size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};