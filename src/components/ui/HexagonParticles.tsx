import React, { useEffect, useRef } from 'react';
import { tsParticles } from '@tsparticles/engine';
import { loadPolygonPath } from '@tsparticles/path-polygon';
import { loadBasic } from '@tsparticles/basic';
import { loadTrailEffect } from '@tsparticles/effect-trail';
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters';
import { useTheme } from '../../hooks/useTheme';

interface HexagonParticlesProps {
  className?: string;
  id?: string|any;
  variant?: 'network' | 'trail' | 'floating';
}

export const HexagonParticles: React.FC<HexagonParticlesProps> = ({ 
  className = '', 
  id = 'hexagon-particles',
  variant = 'network'
}) => {
  const { theme, mode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initParticles = async () => {
      if (isInitialized.current || !containerRef.current) return;
      
      try {
        // Load required plugins
        await loadBasic(tsParticles);
        await loadPolygonPath(tsParticles);
        await loadTrailEffect(tsParticles);
        await loadEmittersPlugin(tsParticles);
        
        // Initialize particles
        await tsParticles.load({
          id: id,
          options: getConfig()
        });
        
        isInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize particles:', error);
      }
    };

    initParticles();

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        const container = tsParticles.domItem(id);
        if (container) {
          container.destroy();
        }
        isInitialized.current = false;
      }
    };
  }, [id, variant, mode]);

  const getConfig :any= () => {
    const baseColor = mode === 'dark' ? '#4285F4' : '#2463EB';
    
    switch (variant) {
      case 'trail':
        return {
          particles: {
            color: {
              value: baseColor,
              animation: {
                enable: true,
                speed: 10
              }
            },
            effect: {
              type: "trail",
              options: {
                trail: {
                  length: 50,
                  minWidth: 4
                }
              }
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "destroy"
              },
              path: {
                clamp: false,
                enable: true,
                delay: {
                  value: 0
                },
                generator: "polygonPathGenerator",
                options: {
                  sides: 6,
                  turnSteps: 30,
                  angle: 30
                }
              },
              random: false,
              speed: 3,
              straight: false
            },
            number: {
              value: 0
            },
            opacity: {
              value: 1
            },
            shape: {
              type: "circle"
            },
            size: {
              value: 2
            }
          },
          background: {
            color: "transparent"
          },
          fullScreen: {
            enable: false,
            zIndex: 0
          },
          emitters: {
            direction: "none",
            rate: {
              quantity: 1,
              delay: 0.25
            },
            size: {
              width: 0,
              height: 0
            },
            position: {
              x: 50,
              y: 50
            }
          }
        };

      case 'floating':
        return {
          particles: {
            color: {
              value: baseColor,
              animation: {
                enable: true,
                speed: 8
              }
            },
            effect: {
              type: "trail",
              options: {
                trail: {
                  length: 30,
                  minWidth: 2
                }
              }
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "out"
              },
              path: {
                clamp: false,
                enable: true,
                delay: {
                  value: 0.5
                },
                generator: "polygonPathGenerator",
                options: {
                  sides: 6,
                  turnSteps: 20,
                  angle: 45
                }
              },
              random: true,
              speed: 2,
              straight: false
            },
            number: {
              value: 0
            },
            opacity: {
              value: 0.8,
              animation: {
                enable: true,
                speed: 3,
                sync: false
              }
            },
            shape: {
              type: "circle"
            },
            size: {
              value: 3,
              random: {
                enable: true,
                minimumValue: 1
              }
            }
          },
          background: {
            color: "transparent"
          },
          fullScreen: {
            enable: false,
            zIndex: 0
          },
          emitters: [
            {
              direction: "none",
              rate: {
                quantity: 1,
                delay: 1
              },
              size: {
                width: 0,
                height: 0
              },
              position: {
                x: 25,
                y: 25
              }
            },
            {
              direction: "none",
              rate: {
                quantity: 1,
                delay: 1.5
              },
              size: {
                width: 0,
                height: 0
              },
              position: {
                x: 75,
                y: 75
              }
            }
          ]
        };

      default: // network
        return {
          particles: {
            color: {
              value: baseColor,
              animation: {
                enable: true,
                speed: 5
              }
            },
            effect: {
              type: "trail",
              options: {
                trail: {
                  length: 40,
                  minWidth: 3
                }
              }
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce"
              },
              path: {
                clamp: true,
                enable: true,
                delay: {
                  value: 0.2
                },
                generator: "polygonPathGenerator",
                options: {
                  sides: 6,
                  turnSteps: 25,
                  angle: 60
                }
              },
              random: false,
              speed: 2.5,
              straight: false
            },
            number: {
              value: 0
            },
            opacity: {
              value: 0.9
            },
            shape: {
              type: "circle"
            },
            size: {
              value: 2.5
            }
          },
          background: {
            color: "transparent"
          },
          fullScreen: {
            enable: false,
            zIndex: 0
          },
          emitters: [
            {
              direction: "none",
              rate: {
                quantity: 1,
                delay: 0.3
              },
              size: {
                width: 0,
                height: 0
              },
              position: {
                x: 30,
                y: 30
              }
            },
            {
              direction: "none",
              rate: {
                quantity: 1,
                delay: 0.4
              },
              size: {
                width: 0,
                height: 0
              },
              position: {
                x: 70,
                y: 70
              }
            },
            {
              direction: "none",
              rate: {
                quantity: 1,
                delay: 0.5
              },
              size: {
                width: 0,
                height: 0
              },
              position: {
                x: 50,
                y: 20
              }
            }
          ]
        };
    }
  };

  return (
    <div 
      ref={containerRef}
      id={id}
      className={`absolute inset-0 ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};