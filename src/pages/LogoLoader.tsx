import Lottie from 'lottie-react';
import animationData from './open_hex_loader_futuristic_blue.json';

const LogoLoader = () => {
  // Modify the frame rate to control speed
  const modifiedAnimationData = {
    ...animationData,
    fr: animationData.fr * 4 // Multiply frame rate by 4 for 4x speed
  };

  return (
    <Lottie
      animationData={modifiedAnimationData}
      style={{ width: 156, height: 156 }}
      loop={true}
      autoplay={true}
      // onComplete={() => console.log('Animation completed')}
      // isPaused={false}
    />
  );
};

export default LogoLoader;