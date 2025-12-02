'use client';

import { motion } from 'framer-motion';
import { Loader2, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type AnimationPhase =
  | 'idle'
  | 'typing'
  | 'waiting'
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
}

const ANIMATION_CONFIG = {
  typeSpeed: 80,
  commandDelay: 300,
  outputLineDelay: 200,
  spinnerDuration: 1200,
  pauseBetweenCommands: 800,
} as const;

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
    showReplayButton: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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
    });
  }, [clearTimer]);

  const handleReplay = useCallback(() => {
    resetAnimation();
  }, [resetAnimation]);

  useEffect(() => {
    if (!autoPlay || prefersReducedMotion) return;

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
        setState((prev) => ({ ...prev, phase: 'waiting' }));
      }
      return;
    }

    if (state.phase === 'waiting') {
      timeoutRef.current = setTimeout(() => {
        if (currentCommand.spinner) {
          setState((prev) => ({ ...prev, phase: 'spinner' }));
        } else {
          setState((prev) => ({ ...prev, phase: 'output' }));
        }
      }, ANIMATION_CONFIG.commandDelay);
      return;
    }

    if (state.phase === 'spinner') {
      timeoutRef.current = setTimeout(() => {
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
  const showCursor = state.phase === 'typing' || state.phase === 'waiting';
  const showSpinner = state.phase === 'spinner';
  const showOutput = state.phase === 'output' || state.phase === 'next';

  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.95 }
      }
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
      className={cn(
        'border-border bg-card shadow-xs relative flex w-full flex-col overflow-hidden rounded-lg border',
        'h-[380px] md:h-[420px] lg:h-[460px]',
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
              {showCursor && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{
                    duration: 1.06,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="inline-block h-4 w-2 bg-blue-500"
                />
              )}
            </div>

            {/* Show spinner */}
            {showSpinner && (
              <div className="mt-2 flex items-center gap-2 pl-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Loader2 className="text-primary h-4 w-4" />
                </motion.div>
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
                      duration: 0.2,
                      delay: lineIndex * 0.15,
                      ease: 'easeOut',
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

      {state.showReplayButton && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={handleReplay}
          className="hover:bg-muted/80 bg-muted text-muted-foreground absolute bottom-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
          aria-label="Replay animation"
        >
          <RotateCcw className="size-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
