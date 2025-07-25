import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, Engine } from '@tsparticles/engine';
import { useTheme } from '../../hooks/useTheme';

interface SimpleHexParticlesProps {
  className?: string;
  id?: string;
}

export const SimpleHexParticles: React.FC<SimpleHexParticlesProps> = ({ 
  className = '', 
  id = 'simple-hex-particles' 
}) => {
  const { mode } = useTheme();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    console.log('Simple particles loaded:', container);
  }, []);

  const particlesConfig = {
    background: {
      color: { value: 'transparent' },
    },
    fpsLimit: 120,
    particles: {
      color: {
        value: mode === 'dark' ? '#4285F4' : '#2463EB',
      },
      links: {
        color: mode === 'dark' ? '#4285F4' : '#2463EB',
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
      },
      number: {
        value: 30,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: 'polygon',
        polygon: {
          sides: 6,
        },
      },
      size: {
        value: { min: 2, max: 5 },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id={id}
      className={`absolute inset-0 ${className}`}
      init={particlesInit}
      loaded={particlesLoaded}
      options={particlesConfig}
    />
  );
};