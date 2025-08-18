import React, { useCallback, useMemo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, Container } from '@tsparticles/engine';
import { useTheme } from '../../hooks/useTheme';

interface ParticlesBackgroundProps {
  className?: string;
  id?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ 
  className = '', 
  id = 'tsparticles' 
}) => {
  const { theme, mode } = useTheme();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = useMemo(() => ({
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 120,
    fullScreen: {
      enable: false,
      zIndex: 0,
    },
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
        triangles: {
          enable: true,
          opacity: 0.1,
        },
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'out',
        },
        random: true,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 40,
      },
      opacity: {
        value: 0.5,
        random: {
          enable: true,
          minimumValue: 0.1,
        },
        animation: {
          enable: true,
          speed: 3,
          sync: false,
        },
      },
      shape: {
        type: 'polygon',
        polygon: {
          sides: 6,
        },
      },
      size: {
        value: 3,
        random: {
          enable: true,
          minimumValue: 1,
        },
        animation: {
          enable: true,
          speed: 20,
          sync: false,
        },
      },
    },
    detectRetina: true,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
        resize: {
          enable: true,
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
        grab: {
          distance: 140,
          links: {
            opacity: 1,
          },
        },
      },
    },
  }), [mode]);

  const particlesLoaded = useCallback(async (container?: Container) => {
    console.log('Particles loaded:', container);
  }, []);

  return (
    <Particles
      id={id}
      className={`absolute inset-0 ${className}`}
      // particlesInit={particlesInit}
      particlesLoaded={particlesLoaded}
      // options={particlesConfig}
    />
  );
};
