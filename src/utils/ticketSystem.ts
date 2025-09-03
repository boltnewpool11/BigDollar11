import { Guide } from '../types';

export interface GuideWithTickets extends Guide {
  ticketNumbers: number[];
  ticketRange: { start: number; end: number };
}

export const assignTicketsToGuides = (guides: Guide[]): GuideWithTickets[] => {
  // Calculate total tickets needed
  const totalTickets = guides.reduce((sum, guide) => sum + guide.totalTickets, 0);
  
  // Create array of all ticket numbers
  const allTickets = Array.from({ length: totalTickets }, (_, i) => i + 1);
  
  // Shuffle the tickets using Fisher-Yates algorithm
  for (let i = allTickets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTickets[i], allTickets[j]] = [allTickets[j], allTickets[i]];
  }
  
  let ticketIndex = 0;
  const guidesWithTickets: GuideWithTickets[] = [];

  for (const guide of guides) {
    const ticketNumbers: number[] = [];
    
    // Assign random tickets to each guide
    for (let i = 0; i < guide.totalTickets; i++) {
      if (ticketIndex < allTickets.length) {
        ticketNumbers.push(allTickets[ticketIndex]);
        ticketIndex++;
      }
    }
    
    // Sort the assigned tickets for display purposes
    ticketNumbers.sort((a, b) => a - b);
    
    const startTicket = ticketNumbers.length > 0 ? Math.min(...ticketNumbers) : 0;
    const endTicket = ticketNumbers.length > 0 ? Math.max(...ticketNumbers) : 0;
    
    guidesWithTickets.push({
      ...guide,
      ticketNumbers,
      ticketRange: { start: startTicket, end: endTicket }
    });
  }

  return guidesWithTickets;
};

export const drawRandomTicket = (guidesWithTickets: GuideWithTickets[]): { winner: GuideWithTickets | null, drawnTicket: number | null } => {
  // Get all available ticket numbers from all guides
  const allAvailableTickets: { ticket: number, guide: GuideWithTickets }[] = [];
  
  guidesWithTickets.forEach(guide => {
    guide.ticketNumbers.forEach(ticketNumber => {
      allAvailableTickets.push({ ticket: ticketNumber, guide });
    });
  });
  
  if (allAvailableTickets.length === 0) {
    return { winner: null, drawnTicket: null };
  }
  
  // Pick a random ticket from all available tickets
  const randomIndex = Math.floor(Math.random() * allAvailableTickets.length);
  const selectedTicket = allAvailableTickets[randomIndex];
  
  return { 
    winner: selectedTicket.guide, 
    drawnTicket: selectedTicket.ticket 
  };
};

export const drawRandomTickets = (guidesWithTickets: GuideWithTickets[], count: number): { winners: GuideWithTickets[], drawnTickets: number[] } => {
  const drawnTickets: number[] = [];
  const winners: GuideWithTickets[] = [];
  const availableGuides = [...guidesWithTickets];

  for (let i = 0; i < count && availableGuides.length > 0; i++) {
    const { winner: winnerGuide, drawnTicket } = drawRandomTicket(availableGuides);
    
    if (winnerGuide && drawnTicket) {
      winners.push(winnerGuide);
      drawnTickets.push(drawnTicket);
      // Remove the winner from available guides to prevent duplicate wins
      const index = availableGuides.indexOf(winnerGuide);
      availableGuides.splice(index, 1);
    }
  }

  return { winners, drawnTickets };
};

export const findGuideByTicket = (ticketNumber: number, guidesWithTickets: GuideWithTickets[]): GuideWithTickets | null => {
  return guidesWithTickets.find(guide => 
    guide.ticketNumbers.includes(ticketNumber)
  ) || null;
};