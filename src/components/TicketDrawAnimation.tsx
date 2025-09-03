import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { GuideWithTickets, PrizeCategory } from '../types';
import { drawRandomTicket } from '../utils/ticketSystem';
import confetti from 'canvas-confetti';

interface TicketDrawAnimationProps {
  guides: GuideWithTickets[];
  isDrawing: boolean;
  onComplete: (winners: GuideWithTickets[], tickets: number[], isRestart?: boolean) => void;
  winnerCount: number;
  prizeCategory: PrizeCategory | null;
}

export const TicketDrawAnimation: React.FC<TicketDrawAnimationProps> = ({
  guides,
  isDrawing,
  onComplete,
  winnerCount,
  prizeCategory
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);
  const [currentWinner, setCurrentWinner] = useState<GuideWithTickets | null>(null);
  const [currentDrawnTicket, setCurrentDrawnTicket] = useState<number | null>(null);
  const [allWinners, setAllWinners] = useState<GuideWithTickets[]>([]);
  const [allDrawnTickets, setAllDrawnTickets] = useState<number[]>([]);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'countdown' | 'drawing' | 'revealing' | 'waiting' | 'complete'>('countdown');
  const [availableGuides, setAvailableGuides] = useState<GuideWithTickets[]>([]);

  useEffect(() => {
    if (!isDrawing) {
      // Reset state when not drawing
      setCountdown(null);
      setCurrentTicket(null);
      setCurrentWinner(null);
      setCurrentDrawnTicket(null);
      setAllWinners([]);
      setAllDrawnTickets([]);
      setCurrentWinnerIndex(0);
      setIsAnimating(false);
      setAnimationPhase('countdown');
      setAvailableGuides([]);
      return;
    }

    if (guides.length === 0) {
      onComplete([], [], false);
      return;
    }

    setAvailableGuides([...guides]);
    setIsAnimating(true);
    setAllWinners([]);
    setAllDrawnTickets([]);
    setCurrentWinnerIndex(0);
    
    // Start with countdown
    startCountdown();
  }, [isDrawing, guides, winnerCount]);

  const startCountdown = () => {
    const countdownDuration = getCountdownDuration();
    setCountdown(countdownDuration);
    setAnimationPhase('countdown');
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            drawSingleTicket();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getCountdownDuration = (): number => {
    if (!prizeCategory) return 5;
    
    switch (prizeCategory.id) {
      case 'refrigerator': return 60;
      case 'tablets': return 20;
      case 'washing-machine': return 15;
      case 'soundbars': return 10;
      case 'iron-box': return 7;
      default: return 5;
    }
  };

  const drawSingleTicket = async () => {
    setAnimationPhase('drawing');
    setCurrentTicket(null);
    setCurrentWinner(null);
    setCurrentDrawnTicket(null);
    
    // Animate ticket selection
    await animateTicketSelection();
    
    // Draw the actual winner
    const { winner, drawnTicket } = drawRandomTicket(availableGuides);
    
    if (winner && drawnTicket) {
      setCurrentWinner(winner);
      setCurrentDrawnTicket(drawnTicket);
      setAllWinners(prev => [...prev, winner]);
      setAllDrawnTickets(prev => [...prev, drawnTicket]);
      
      // Remove winner from available guides
      setAvailableGuides(prev => prev.filter(g => g.id !== winner.id));
      
      // Celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
      });
      
      setAnimationPhase('revealing');
    } else {
      // No more winners available
      completeDrawing();
    }
  };

  const handleNextWinner = () => {
    const nextIndex = currentWinnerIndex + 1;
    setCurrentWinnerIndex(nextIndex);
    
    if (nextIndex < winnerCount && availableGuides.length > 0) {
      setAnimationPhase('waiting');
      setTimeout(() => {
        drawSingleTicket();
      }, 1000);
    } else {
      completeDrawing();
    }
  };

  const completeDrawing = () => {
    setAnimationPhase('complete');
    setTimeout(() => {
      onComplete(allWinners, allDrawnTickets, false);
    }, 1500);
  };

  const animateTicketSelection = (): Promise<void> => {
    return new Promise((resolve) => {
      let count = 0;
      const maxCount = 30;
      
      // Get all available tickets for animation
      const allTickets: number[] = [];
      availableGuides.forEach(guide => {
        allTickets.push(...guide.ticketNumbers);
      });
      
      if (allTickets.length === 0) {
        resolve();
        return;
      }
      
      const interval = setInterval(() => {
        const randomTicket = allTickets[Math.floor(Math.random() * allTickets.length)];
        setCurrentTicket(randomTicket);
        count++;
        
        if (count >= maxCount) {
          clearInterval(interval);
          setTimeout(() => {
            resolve();
          }, 200);
        }
      }, 80);
    });
  };

  const handleRestart = () => {
    setIsAnimating(false);
    onComplete([], [], true);
  };

  if (!isDrawing || !isAnimating) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl w-full mx-4"
        >
          {/* Countdown Phase */}
          {animationPhase === 'countdown' && countdown !== null && (
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity
                }}
                className="mb-6"
              >
                {prizeCategory && <div className="text-8xl mb-4">{prizeCategory.icon}</div>}
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-4">
                {prizeCategory?.name || 'Prize Draw'}
              </h2>
              
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-bold text-yellow-300 mb-6"
              >
                {countdown}
              </motion.div>
              
              <p className="text-blue-200 text-lg">
                Get ready for the magical draw!
              </p>
            </div>
          )}

          {/* Drawing Phase */}
          {animationPhase === 'drawing' && (
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-6"
              >
                <Ticket className="w-24 h-24 text-yellow-300 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                🎰 Drawing Ticket...
              </h2>
              
              {prizeCategory && (
                <div className="mb-6">
                  <div className="text-4xl mb-2">{prizeCategory.icon}</div>
                  <p className="text-xl text-blue-200">{prizeCategory.name}</p>
                  <p className="text-sm text-blue-300">
                    Winner {currentWinnerIndex + 1} of {winnerCount}
                  </p>
                </div>
              )}
              
              {currentTicket && (
                <motion.div
                  key={currentTicket}
                  initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6 shadow-2xl"
                >
                  <div className="text-white text-6xl font-bold">
                    #{currentTicket.toString().padStart(4, '0')}
                  </div>
                </motion.div>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-blue-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Selecting magical ticket...</span>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          )}

          {/* Revealing Phase */}
          {animationPhase === 'revealing' && currentWinner && currentDrawnTicket && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="mb-6"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {prizeCategory ? `${prizeCategory.icon} WINNER #${currentWinnerIndex + 1} ${prizeCategory.icon}` : `🏆 WINNER #${currentWinnerIndex + 1} 🏆`}
                </h2>
              </motion.div>
              
              {/* Winning Ticket */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6 shadow-2xl"
              >
                <div className="text-white text-6xl font-bold mb-2">
                  #{currentDrawnTicket.toString().padStart(4, '0')}
                </div>
                <div className="text-white text-lg font-semibold">
                  🎫 Winning Ticket
                </div>
              </motion.div>

              {/* Winner Details */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 mb-6"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {currentWinner.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {currentWinner.name}
                </h3>
                <p className="text-lg text-blue-100 mb-4">
                  {currentWinner.department}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-blue-200">Supervisor</p>
                    <p className="font-semibold text-white">{currentWinner.supervisor}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-blue-200">Total Tickets</p>
                    <p className="font-semibold text-white">{currentWinner.totalTickets}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-blue-200">NPS Score</p>
                    <p className="font-semibold text-white">{currentWinner.nps}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-blue-200">NRPC Score</p>
                    <p className="font-semibold text-white">{currentWinner.nrpc}</p>
                  </div>
                </div>
              </motion.div>

              {/* Next Winner Button or Complete */}
              <div className="flex justify-center gap-4">
                {currentWinnerIndex + 1 < winnerCount && availableGuides.length > 1 ? (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 }}
                    onClick={handleNextWinner}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Draw Next Winner
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 }}
                    onClick={completeDrawing}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/50 transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Complete Draw
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* Waiting Phase */}
          {animationPhase === 'waiting' && (
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity
                }}
                className="mb-6"
              >
                <Sparkles className="w-16 h-16 text-blue-300 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Preparing next draw...
              </h2>
              
              <p className="text-blue-200">
                Winner {currentWinnerIndex + 1} of {winnerCount}
              </p>
            </div>
          )}

          {/* Complete Phase */}
          {animationPhase === 'complete' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-4">
                All Winners Selected!
              </h2>
              <p className="text-blue-200 mb-4">
                {allWinners.length} winner{allWinners.length > 1 ? 's' : ''} selected and saved to database.
              </p>
              
              {/* Winners Summary */}
              <div className="space-y-2 mb-6">
                {allWinners.map((winner, index) => (
                  <div key={winner.id} className="bg-white/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-white font-semibold">{winner.name}</span>
                    <span className="text-yellow-300 font-bold">
                      🎫 #{allDrawnTickets[index]?.toString().padStart(4, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancel Button (only during countdown and drawing) */}
          {(animationPhase === 'countdown' || animationPhase === 'drawing') && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Cancel Draw
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

      
      // Find the guide who owns this ticket
      const winner = guides.find(guide => 
        drawnTicket >= guide.startTicket && drawnTicket < guide.startTicket + guide.totalTickets
      );
      
      if (winner && !winners.find(w => w.id === winner.id)) {
        winners.push(winner);
        tickets.push(drawnTicket);
        
        // Remove all tickets for this guide from the pool
        for (let j = allTickets.length - 1; j >= 0; j--) {
          const ticket = allTickets[j];
          if (ticket >= winner.startTicket && ticket < winner.startTicket + winner.totalTickets) {
            allTickets.splice(j, 1);
          }
        }
        
        // Celebration confetti for each winner
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
        });
        
        // Brief pause between winners
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setSelectedWinners(winners);
    setDrawnTickets(tickets);
    setAnimationPhase('revealing');
    
    // Show results for a moment before completing
    setTimeout(() => {
      setAnimationPhase('complete');
      setTimeout(() => {
        onComplete(winners, tickets, false);
      }, 1000);
    }, 2000);
  };

  const animateTicketSelection = (availableTickets: number[]): Promise<void> => {
    return new Promise((resolve) => {
      let count = 0;
      const maxCount = 20;
      
      const interval = setInterval(() => {
        const randomTicket = availableTickets[Math.floor(Math.random() * availableTickets.length)];
        setCurrentTicket(randomTicket);
        count++;
        
        if (count >= maxCount) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const handleRestart = () => {
    setIsAnimating(false);
    onComplete([], [], true);
  };

  if (!isDrawing || !isAnimating) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl w-full mx-4"
        >
          {animationPhase === 'drawing' && (
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-6"
              >
                <Ticket className="w-24 h-24 text-yellow-300 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                🎰 Drawing Tickets...
              </h2>
              
              {prizeCategory && (
                <div className="mb-6">
                  <div className="text-6xl mb-2">{prizeCategory.icon}</div>
                  <p className="text-xl text-blue-200">{prizeCategory.name}</p>
                  <p className="text-sm text-blue-300">Drawing {winnerCount} winner{winnerCount > 1 ? 's' : ''}</p>
                </div>
              )}
              
              {currentTicket && (
                <motion.div
                  key={currentTicket}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6"
                >
                  <div className="text-white text-4xl font-bold">
                    #{currentTicket.toString().padStart(4, '0')}
                  </div>
                </motion.div>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-blue-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Selecting magical tickets...</span>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          )}

          {animationPhase === 'revealing' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-6"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Winners Selected!
                </h2>
              </motion.div>
              
              <div className="space-y-4 mb-6">
                {selectedWinners.map((winner, index) => (
                  <motion.div
                    key={winner.id}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.3 }}
                    className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <div className="font-bold text-lg">{winner.name}</div>
                        <div className="text-sm text-blue-200">{winner.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-300 font-bold">
                          🎫 #{drawnTickets[index]?.toString().padStart(4, '0')}
                        </div>
                        <div className="text-xs text-blue-300">
                          {winner.totalTickets} tickets
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {animationPhase === 'complete' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Draw Complete!
              </h2>
              <p className="text-blue-200">
                Winners have been saved to the database.
              </p>
            </div>
          )}

          {animationPhase === 'drawing' && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Cancel Draw
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};