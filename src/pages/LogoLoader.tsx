import Lottie from 'lottie-react';
import animationData from './open_hex_loader_futuristic_blue.json';

const LogoLoader = () => (
    <Lottie
        animationData={animationData}
        style={{ width: 156, height: 156 }}
        loop={true}              // Default is true
        autoplay={true}          // Default is true
        speed={4}                // Animation speed (1 = normal, 2 = 2x speed)
    // onComplete={() => console.log('Animation completed')}
    // isPaused={false}       // Control play/pause
    />
);
export default LogoLoader;