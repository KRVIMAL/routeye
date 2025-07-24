import  { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialTime: number; // in seconds
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
  format?: 'mm:ss' | 'ss';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialTime,
  onComplete,
  onTick,
  format = 'mm:ss',
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTimeLeft(initialTime);
    setIsActive(true);
  }, [initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          onTick?.(newTime);
          
          if (newTime <= 0) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete, onTick]);

  const formatTime = (seconds: number): string => {
    if (format === 'ss') {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const restart = (newTime?: number) => {
    setTimeLeft(newTime || initialTime);
    setIsActive(true);
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isComplete: timeLeft === 0,
    restart,
  };
};