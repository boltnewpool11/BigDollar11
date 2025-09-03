import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles } from 'lucide-react';
import { GuideWithTickets, PrizeCategory } from '../types';
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
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);
  const [drawnTickets, setDrawnTickets] = useState<number[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<GuideWithTickets[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'drawing' | 'revealing' | 'complete'>('drawing');

  useEffect(() => {
    if (!isDrawing) {
      // Reset state when not drawing
      setCurrentTicket(null);
      setDrawnTickets([]);
      setSelectedWinners([]);
      setIsAnimating(false);
      setAnimationPhase('drawing');
      return;
    }

    if (guides.length === 0) {
      onComplete([], [], false);
      return;
    }

    setIsAnimating(true);
    setAnimationPhase('drawing');
    
    // Start the drawing animation
    drawTickets();
  }, [isDrawing, guides, winnerCount]);

  const drawTickets = async () => {
    const allTickets: number[] = [];
    
    // Create ticket pool
    guides.forEach(guide => {
      for (let i = 0; i < guide.totalTickets; i++) {
        allTickets.push(guide.startTicket + i);
      }
    });

    if (allTickets.length === 0) {
      onComplete([], [], false);
      return;
    }

    const winners: GuideWithTickets[] = [];
    const tickets: number[] = [];
    
    // Draw the required number of winners
    for (let i = 0; i < winnerCount && allTickets.length > 0; i++) {
      // Animate ticket selection
      await animateTicketSelection(allTickets);
      
      // Select random ticket
      const randomIndex = Math.floor(Math.random() * allTickets.length);
      const drawnTicket = allTickets[randomIndex];
      
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