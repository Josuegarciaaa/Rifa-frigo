import React, { useState, useEffect } from 'react';

const WheelOfFortune = ({ onSpin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [canSpin, setCanSpin] = useState(false);

  useEffect(() => {
    const targetDate = new Date('2025-12-25T21:00:00Z'); // 3 PM CST = 9 PM UTC

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setCanSpin(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCanSpin(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (canSpin && !isSpinning) {
      handleSpin();
    }
  }, [canSpin, isSpinning]);

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    const winningNumber = Math.floor(Math.random() * 100) + 1;

    setTimeout(() => {
      setIsSpinning(false);
      onSpin(winningNumber);
    }, 3000); // Simulate spin duration
  };

  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 shadow-lg"></div>
        </div>
        <div className={`w-96 h-96 sm:w-[28rem] sm:h-[28rem] lg:w-[36rem] lg:h-[36rem] xl:w-[48rem] xl:h-[48rem] rounded-full border-8 sm:border-12 lg:border-16 xl:border-20 border-yellow-400 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold transition-transform duration-3000 shadow-2xl ${isSpinning ? 'animate-spin' : ''}`}>
          {numbers.map((number, index) => {
            const angle = (360 / 100) * index - 90; // Start from top
            const radian = (angle * Math.PI) / 180;
            const radius = window.innerWidth < 640 ? 120 : window.innerWidth < 1024 ? 135 : window.innerWidth < 1280 ? 165 : 195; // Responsive radius
            const x = radius * Math.cos(radian);
            const y = radius * Math.sin(radian);

            return (
              <div
                key={number}
                className="absolute text-[6px] sm:text-[8px] lg:text-[10px] xl:text-[12px] font-bold text-white bg-black bg-opacity-90 rounded-full w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-md"
                style={{
                  left: 'calc(50% + ' + x + 'px)',
                  top: 'calc(50% + ' + y + 'px)',
                }}
              >
                {number}
              </div>
            );
          })}
          <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">SORTEO</div>
        </div>
        <div className="absolute inset-0 rounded-full border-2 sm:border-3 lg:border-4 xl:border-6 border-white opacity-25"></div>
      </div>
      {!canSpin && (
        <div className="mt-6 sm:mt-8 text-center w-full max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">⏰ Tiempo restante para el sorteo:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.days}</div>
              <div className="text-xs sm:text-sm text-white">Días</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.hours}</div>
              <div className="text-xs sm:text-sm text-white">Horas</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.minutes}</div>
              <div className="text-xs sm:text-sm text-white">Minutos</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg border border-white border-opacity-20">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{timeLeft.seconds}</div>
              <div className="text-xs sm:text-sm text-white">Segundos</div>
            </div>
          </div>
        </div>
      )}
      {isSpinning && (
        <div className="mt-6 sm:mt-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 drop-shadow-lg animate-pulse">🎡 ¡La ruleta está girando!</h3>
          <div className="mt-4 text-sm text-white">El ganador se anunciará en breve...</div>
        </div>
      )}
    </div>
  );
};

export default WheelOfFortune;
