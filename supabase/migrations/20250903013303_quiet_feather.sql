/*
  # Add drawn ticket and ticket numbers columns to winners table

  1. Schema Changes
    - Add `drawn_ticket` column to store the specific ticket number that was drawn
    - Add `ticket_numbers` column to store all ticket numbers owned by the winner (as JSON)
  
  2. Data Integrity
    - Both columns are nullable to maintain compatibility with existing data
    - `drawn_ticket` stores the winning ticket number as integer
    - `ticket_numbers` stores the complete list of tickets as JSON text
  
  3. Purpose
    - `drawn_ticket`: Shows exactly which ticket was selected in the draw
    - `ticket_numbers`: Provides complete audit trail of all tickets owned by winner
*/

-- Add drawn_ticket column to store the specific winning ticket number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'winners' AND column_name = 'drawn_ticket'
  ) THEN
    ALTER TABLE winners ADD COLUMN drawn_ticket integer;
  END IF;
END $$;

-- Add ticket_numbers column to store all ticket numbers owned by the winner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'winners' AND column_name = 'ticket_numbers'
  ) THEN
    ALTER TABLE winners ADD COLUMN ticket_numbers text;
  END IF;
END $$;

-- Add index on drawn_ticket for faster queries
CREATE INDEX IF NOT EXISTS idx_winners_drawn_ticket ON winners (drawn_ticket);

-- Add index on prize_category for faster filtering
CREATE INDEX IF NOT EXISTS idx_winners_prize_category ON winners (prize_category);