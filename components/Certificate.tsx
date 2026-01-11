import React from 'react';
import { User } from '../types';
import { Button } from './Button';
import { Download, ArrowLeft } from 'lucide-react';

interface CertificateProps {
  user: User;
  onBack: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ user, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const date = new Date().toLocaleDateString('vi-VN');

  return (
    <div className="min-h-screen bg-gray-900/50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-2xl overflow-hidden relative">
        {/* Controls (Hidden when printing) */}
        <div className="bg-gray-100 p-4 flex justify-between print:hidden border-b">
           <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
             <ArrowLeft size={16}/> Quay lại
           </Button>
           <Button onClick={handlePrint} className="flex items-center gap-2">
             <Download size={16}/> In / Tải về
           </Button>
        </div>

        {/* Certificate Content */}
        <div className="p-8 md:p-12 text-center relative border-[20px] border-double border-amber-700 m-4 bg-[#fffbf0]">
           {/* Corner Decorations */}
           <div className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 border-t-4 border-l-4 border-amber-600"></div>
           <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 border-t-4 border-r-4 border-amber-600"></div>
           <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 border-b-4 border-l-4 border-amber-600"></div>
           <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 border-b-4 border-r-4 border-amber-600"></div>

           <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-amber-800 mb-2 uppercase tracking-wider">Giấy Chứng Nhận</h1>
              <div className="w-1/2 h-1 bg-amber-800 mx-auto"></div>
              <p className="text-lg md:text-xl text-amber-700 font-serif mt-2 italic">Trò chơi: Sử Việt Tranh Tài</p>
           </div>

           <div className="space-y-4 md:space-y-6 my-8 md:my-12">
              <p className="text-lg md:text-xl text-gray-600 font-serif">Chứng nhận em:</p>
              <h2 className="text-3xl md:text-5xl font-bold text-primary font-display uppercase tracking-wide">{user.name}</h2>
              <p className="text-lg md:text-xl text-gray-600 font-serif">Học sinh lớp: <span className="font-bold text-black">{user.className}</span></p>
              
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Đã xuất sắc vượt qua tất cả các thử thách và hoàn thành khóa tìm hiểu lịch sử Việt Nam với tổng số điểm là:
              </p>
              <div className="text-4xl md:text-5xl font-bold text-red-600 font-display">{user.totalScore} Điểm</div>
           </div>

           <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-12 md:mt-16 px-4 md:px-12 gap-8">
              <div className="text-center order-2 md:order-1">
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 mx-auto mb-2">
                    <span className="text-4xl md:text-5xl">🏅</span>
                 </div>
                 <p className="font-bold text-amber-800 text-sm md:text-base">HUY HIỆU DANH DỰ</p>
              </div>
              <div className="text-center font-serif order-1 md:order-2">
                 <p className="italic mb-2 md:mb-4">Việt Nam, ngày {date.split('/')[0]} tháng {date.split('/')[1]} năm {date.split('/')[2]}</p>
                 <p className="font-bold text-lg md:text-xl mb-12 md:mb-16">BAN QUẢN TRỊ</p>
                 <p className="font-bold text-amber-800 text-lg">Sử Việt Tranh Tài</p>
              </div>
           </div>
        </div>
      </div>
      
      {/* CSS for printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-4xl, .max-w-4xl * {
            visibility: visible;
          }
          .max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}