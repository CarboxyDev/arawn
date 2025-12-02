'use client';

import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type AnimationPhase =
  | 'idle'
  | 'typing'
  | 'waiting'
  | 'enter-flash'
  | 'spinner'
  | 'output'
  | 'next'
  | 'complete';

interface TerminalCommand {
  command: string;
  output: string[];
  spinner: boolean;
}

interface AnimatedTerminalProps {
  className?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

interface TerminalState {
  phase: AnimationPhase;
  currentCommandIndex: number;
  currentCharIndex: number;
  completedCommands: number[];
  showReplayButton: boolean;
  isPaused: boolean;
  spinnerFrame: number;
}

const ANIMATION_CONFIG = {
  typeSpeed: 80,
  commandDelay: 300,
  outputLineDelay: 200,
  spinnerDuration: 1200,
  pauseBetweenCommands: 800,
  enterFlashDuration: 150,
  spinnerFrameDuration: 80,
} as const;

// Terminal-style spinner frames
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const TERMINAL_COMMANDS: TerminalCommand[] = [
  {
    command: 'pnpm create blitzpack',
    spinner: true,
    output: [
      '✓ Project created successfully',
      '✓ Dependencies installed',
      '✓ Git initialized',
    ],
  },
  {
    command: 'docker compose up -d && pnpm db:migrate',
    spinner: true,
    output: [
      '✓ PostgreSQL started on port 5432',
      '✓ Database migrations applied',
    ],
  },
  {
    command: 'pnpm dev',
    spinner: false,
    output: [
      '✓ Web: http://localhost:3000',
      '✓ API: http://localhost:8080',
      '🚀 Ready in 1.2s',
    ],
  },
];

export function AnimatedTerminal({
  className,
  autoPlay = true,
  onComplete,
}: AnimatedTerminalProps): React.ReactElement {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [state, setState] = useState<TerminalState>({
    phase: prefersReducedMotion ? 'complete' : 'idle',
    currentCommandIndex: 0,
    currentCharIndex: 0,
    completedCommands: prefersReducedMotion ? [0, 1, 2] : [],
    showReplayButton: prefersReducedMotion ? true : false,
    isPaused: false,
    spinnerFrame: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinnerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (spinnerIntervalRef.current) {
      clearInterval(spinnerIntervalRef.current);
      spinnerIntervalRef.current = null;
    }
  }, []);

  const resetAnimation = useCallback(() => {
    clearTimer();
    setState({
      phase: 'idle',
      currentCommandIndex: 0,
      currentCharIndex: 0,
      completedCommands: [],
      showReplayButton: false,
      isPaused: false,
      spinnerFrame: 0,
    });
  }, [clearTimer]);

  const handleReplay = useCallback(() => {
    resetAnimation();
  }, [resetAnimation]);

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleContainerClick = useCallback(() => {
    if (state.phase === 'complete') {
      handleReplay();
    }
  }, [state.phase, handleReplay]);

  useEffect(() => {
    if (!autoPlay || prefersReducedMotion || state.isPaused) return;

    const currentCommand = TERMINAL_COMMANDS[state.currentCommandIndex];

    if (state.phase === 'idle') {
      setState((prev) => ({ ...prev, phase: 'typing' }));
      return;
    }

    if (state.phase === 'typing') {
      if (state.currentCharIndex < currentCommand.command.length) {
        timeoutRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentCharIndex: prev.currentCharIndex + 1,
          }));
        }, ANIMATION_CONFIG.typeSpeed);
      } else {
        setState((prev) => ({ ...prev, phase: 'enter-flash' }));
      }
      return;
    }

    if (state.phase === 'enter-flash') {
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'waiting' }));
      }, ANIMATION_CONFIG.enterFlashDuration);
      return;
    }

    if (state.phase === 'waiting') {
      timeoutRef.current = setTimeout(() => {
        if (currentCommand.spinner) {
          setState((prev) => ({ ...prev, phase: 'spinner', spinnerFrame: 0 }));
        } else {
          setState((prev) => ({ ...prev, phase: 'output' }));
        }
      }, ANIMATION_CONFIG.commandDelay);
      return;
    }

    if (state.phase === 'spinner') {
      spinnerIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          spinnerFrame: (prev.spinnerFrame + 1) % SPINNER_FRAMES.length,
        }));
      }, ANIMATION_CONFIG.spinnerFrameDuration);

      timeoutRef.current = setTimeout(() => {
        if (spinnerIntervalRef.current) {
          clearInterval(spinnerIntervalRef.current);
          spinnerIntervalRef.current = null;
        }
        setState((prev) => ({ ...prev, phase: 'output' }));
      }, ANIMATION_CONFIG.spinnerDuration);
      return;
    }

    if (state.phase === 'output') {
      const outputDelay =
        currentCommand.output.length * ANIMATION_CONFIG.outputLineDelay +
        ANIMATION_CONFIG.pauseBetweenCommands;

      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'next' }));
      }, outputDelay);
      return;
    }

    if (state.phase === 'next') {
      const nextIndex = state.currentCommandIndex + 1;

      if (nextIndex >= TERMINAL_COMMANDS.length) {
        setState((prev) => ({
          ...prev,
          phase: 'complete',
          completedCommands: [
            ...prev.completedCommands,
            prev.currentCommandIndex,
          ],
          showReplayButton: true,
        }));
        onComplete?.();
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'typing',
          completedCommands: [
            ...prev.completedCommands,
            prev.currentCommandIndex,
          ],
          currentCommandIndex: nextIndex,
          currentCharIndex: 0,
        }));
      }
      return;
    }

    return () => {
      clearTimer();
    };
  }, [
    state.phase,
    state.currentCommandIndex,
    state.currentCharIndex,
    state.isPaused,
    autoPlay,
    prefersReducedMotion,
    clearTimer,
    onComplete,
  ]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const currentCommand = TERMINAL_COMMANDS[state.currentCommandIndex];
  const typedCommand = currentCommand
    ? currentCommand.command.slice(0, state.currentCharIndex)
    : '';
  const showCursor =
    state.phase === 'typing' ||
    state.phase === 'waiting' ||
    state.phase === 'enter-flash';
  const showSpinner = state.phase === 'spinner';
  const showOutput = state.phase === 'output' || state.phase === 'next';
  const isEnterFlash = state.phase === 'enter-flash';

  // Calculate staggered delay based on line content
  const getOutputDelay = (lineIndex: number, line: string): number => {
    const baseDelay = lineIndex * 0.1;
    const lengthFactor = line.length > 50 ? 0.05 : 0;
    const importantLinePause =
      line.includes('http') || line.includes('🚀') ? 0.08 : 0;
    return baseDelay + lengthFactor + importantLinePause;
  };

  return (
    <>
      <style>{`
        @keyframes cursor-blink {
          0%, 70% {
            opacity: 1;
          }
          71%, 100% {
            opacity: 0;
          }
        }
        .terminal-cursor {
          animation: cursor-blink 1.2s infinite;
        }
      `}</style>
      <motion.div
        initial={
          prefersReducedMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.95 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: 'easeOut',
        }}
        onClick={handleContainerClick}
        className={cn(
          'border-border bg-card shadow-xs relative flex w-full flex-col overflow-hidden rounded-lg border',
          'h-[380px] md:h-[420px] lg:h-[460px]',
          state.phase === 'complete' && 'cursor-pointer',
          className
        )}
      >
        {/* Terminal Header */}
        <div className="border-border flex h-10 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="text-muted-foreground absolute left-1/2 -translate-x-1/2 text-xs font-medium">
            blitzpack
          </div>
          {!prefersReducedMotion && state.phase !== 'complete' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="hover:bg-muted/80 text-muted-foreground flex size-6 items-center justify-center rounded transition-colors"
              aria-label={
                state.isPaused ? 'Resume animation' : 'Pause animation'
              }
            >
              {state.isPaused ? (
                <Play className="size-3.5" />
              ) : (
                <Pause className="size-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-auto px-4 py-4 font-mono text-sm leading-relaxed lg:px-6 lg:py-5">
          {/* Render completed commands */}
          {state.completedCommands.map((cmdIndex) => {
            const cmd = TERMINAL_COMMANDS[cmdIndex];
            return (
              <div key={cmdIndex} className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-primary">$</span>
                  <span className="text-foreground">{cmd.command}</span>
                </div>
                <div className="space-y-1 pl-6">
                  {cmd.output.map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className="text-muted-foreground"
                      style={{
                        color:
                          line.startsWith('✓') || line.startsWith('🚀')
                            ? 'oklch(0.7 0.15 145)'
                            : undefined,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Current command being typed */}
          {currentCommand && state.phase !== 'complete' && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="text-primary">$</span>
                <span className="text-foreground">{typedCommand}</span>
                {showCursor && !isEnterFlash && (
                  <span className="terminal-cursor inline-block h-4 w-2 bg-blue-500" />
                )}
                {isEnterFlash && (
                  <motion.span
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="inline-block h-4 w-4 rounded-full bg-blue-500/30"
                  />
                )}
              </div>

              {/* Show spinner */}
              {showSpinner && (
                <div className="mt-2 flex items-center gap-2 pl-6">
                  <span className="text-primary text-base">
                    {SPINNER_FRAMES[state.spinnerFrame]}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Running...
                  </span>
                </div>
              )}

              {/* Show output */}
              {showOutput && (
                <div className="mt-2 space-y-1 pl-6">
                  {currentCommand.output.map((line, lineIndex) => (
                    <motion.div
                      key={lineIndex}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: getOutputDelay(lineIndex, line),
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="text-muted-foreground"
                      style={{
                        color:
                          line.startsWith('✓') || line.startsWith('🚀')
                            ? 'oklch(0.7 0.15 145)'
                            : undefined,
                      }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
