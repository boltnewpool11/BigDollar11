# 🎪 Big Dollar Contest - Multi-Prize Raffle System

A sophisticated, weighted ticket-based raffle system designed for conducting fair and transparent prize draws across multiple categories. Built with React, TypeScript, and Supabase.

## 🎯 System Overview

The Big Dollar Contest is a comprehensive raffle management system that allows administrators to conduct multiple prize draws using a weighted ticket system based on employee performance metrics.

## 🎫 How the Raffle System Works

### 1. Ticket Assignment Logic

The system uses a sophisticated weighted ticket assignment algorithm:

#### **Performance-Based Ticket Calculation**
Each guide receives tickets based on their performance metrics:
- **NPS (Net Promoter Score)**: Customer satisfaction rating
- **NRPC (Net Revenue Per Customer)**: Revenue efficiency metric  
- **Refund Percentage**: Lower is better (risk factor)

#### **Ticket Distribution Algorithm**
```typescript
// Located in: src/utils/ticketSystem.ts
export const assignTicketsToGuides = (guides: Guide[]): GuideWithTickets[]
```

**Key Features:**
- **Random Distribution**: Tickets are shuffled using Fisher-Yates algorithm
- **Non-Sequential Assignment**: Each guide gets random, non-consecutive ticket numbers
- **Fair Allocation**: Higher performers get more tickets = higher winning chances
- **Transparent Ranges**: Each guide has a clear ticket range for verification

**Example:**
- Guide A (40 tickets): Gets random tickets like #0001, #0156, #0789, #1234...
- Guide B (25 tickets): Gets different random tickets like #0045, #0234, #0567...

### 2. Multi-Prize Category System

The system supports 5 distinct prize categories:

| Prize Category | Winners | Icon | Countdown Duration |
|---------------|---------|------|-------------------|
| 🥇 1st Prize - Refrigerator | 1 | ❄️ | 60 seconds |
| 🥈 2nd Prize - Samsung Tablets | 2 | 📱 | 20 seconds |
| 🥉 3rd Prize - Washing Machine | 2 | 🧺 | 15 seconds |
| 🏆 4th Prize - BOAT Sound Bars | 8 | 🔊 | 10 seconds |
| 🎁 5th Prize - Iron Box | 15 | 👔 | 7 seconds |

### 3. Drawing Process

#### **Phase 1: Prize Selection**
```typescript
// Located in: src/components/PrizeSelectionModal.tsx
```
- Admin selects which prize category to draw
- System shows available guides and total tickets in pool
- Validates sufficient participants for the draw

#### **Phase 2: Ticket Drawing Animation**
```typescript
// Located in: src/components/TicketDrawAnimation.tsx
```

**Multi-Phase Process:**
1. **Countdown Phase**: Builds suspense with category-specific countdown
2. **Drawing Phase**: Animated ticket scrolling simulation
3. **Revealing Phase**: Shows drawn ticket and winner details
4. **Waiting Phase**: (Multi-winner only) Pause between draws

#### **Phase 3: Winner Selection Logic**
```typescript
// Located in: src/utils/ticketSystem.ts
export const drawRandomTickets = (guidesWithTickets: GuideWithTickets[], count: number)
```

**Algorithm:**
1. Collect all available ticket numbers from eligible guides
2. Randomly select a ticket using `Math.random()`
3. Find the guide who owns that ticket
4. Remove winner from pool to prevent duplicate wins
5. Repeat for multiple winners

#### **Phase 4: Winner Animation & Database Storage**
```typescript
// Located in: src/components/WinnerAnimation.tsx
// Database: src/hooks/useWinners.ts
```
- Celebratory animations with confetti effects
- Immediate database storage of winner information
- Real-time updates across all connected sessions

### 4. Database Schema

#### **Winners Table Structure**
```sql
CREATE TABLE winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id integer NOT NULL,
  name text NOT NULL,
  supervisor text NOT NULL,
  department text NOT NULL,
  nps numeric NOT NULL,
  nrpc numeric NOT NULL,
  refund_percent numeric NOT NULL,
  total_tickets integer NOT NULL,
  won_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  prize_category text,
  prize_name text
);
```

#### **Row Level Security (RLS)**
- Public read/write access for demo purposes
- Can be restricted to authenticated users only
- Real-time subscriptions for live updates

### 5. Fairness & Transparency Features

#### **Weighted Probability System**
- **Higher performers get more tickets** = Higher winning probability
- **Transparent ticket assignments** = Verifiable fairness
- **Random ticket distribution** = No predictable patterns

#### **Anti-Duplicate Measures**
- Winners are immediately removed from subsequent draws
- Each guide can only win once across all categories
- Database constraints prevent duplicate entries

#### **Audit Trail**
- Complete winner history with timestamps
- Exportable reports (Excel/PDF)
- Performance metrics preserved for verification

## 🏗️ Technical Architecture

### Frontend Components

#### **Core Views**
- `GuidesView.tsx`: Universal pool management and ticket visualization
- `RaffleView.tsx`: Prize selection and draw orchestration
- `WinnersView.tsx`: Winner dashboard and export functionality

#### **Animation Components**
- `TicketDrawAnimation.tsx`: Handles the dramatic ticket drawing sequence
- `WinnerAnimation.tsx`: Celebration animations and winner reveals
- `PrizeDrawModal.tsx`: Prize-specific draw confirmation

#### **Utility Systems**
- `ticketSystem.ts`: Core raffle logic and ticket management
- `exportUtils.ts`: Excel/PDF generation for reports
- `auth.ts`: Simple authentication system

### Data Flow

```
1. Guides Data (JSON) → Ticket Assignment → Universal Pool
2. Prize Selection → Available Pool Filtering → Draw Execution
3. Random Ticket Selection → Winner Identification → Database Storage
4. Real-time Updates → Dashboard Refresh → Export Generation
```

## 🎮 User Experience Flow

### **Administrator Journey**
1. **Login**: Secure access with credentials
2. **View Pool**: See all guides with assigned tickets
3. **Select Prize**: Choose category from available options
4. **Watch Draw**: Enjoy animated ticket drawing process
5. **Celebrate**: Winner reveal with confetti and animations
6. **Manage**: Export reports or purge data as needed

### **Draw Experience**
- **Suspenseful Countdown**: Category-specific timing builds excitement
- **Visual Ticket Draw**: Animated scrolling creates anticipation
- **Dramatic Reveal**: Winner announcement with celebration effects
- **Multi-Winner Support**: Seamless handling of multiple winners per category

## 📊 Performance Metrics Integration

### **NPS (Net Promoter Score)**
- Range: 0-100
- Higher = Better customer satisfaction
- Directly impacts ticket allocation

### **NRPC (Net Revenue Per Customer)**
- Measures revenue efficiency
- Higher values = More tickets
- Key performance indicator

### **Refund Percentage**
- Lower = Better (less risk)
- Affects ticket calculation
- Quality control metric

## 🔧 Configuration

### **Prize Categories**
Easily configurable in `src/data/prizeCategories.ts`:
```typescript
{
  id: 'unique-identifier',
  name: 'Display Name',
  description: 'Prize Description',
  winnerCount: 1, // Number of winners
  image: 'image-url',
  gradient: 'tailwind-gradient-classes',
  icon: '🎁' // Emoji icon
}
```

### **Authentication**
Simple credential-based system in `src/utils/auth.ts`:
- Username: `admin`
- Password: `InternationalMessaging@20`

## 📈 Export & Reporting

### **Excel Export Features**
- Complete winner details with ticket information
- Performance metrics breakdown
- Prize category analysis
- Timestamp tracking

### **PDF Export Features**
- Professional formatted reports
- Summary statistics
- Department breakdowns
- Audit-ready documentation

## 🛡️ Security & Fairness

### **Randomization**
- **Fisher-Yates Shuffle**: Cryptographically sound ticket distribution
- **Math.random()**: Secure random number generation for draws
- **No Predictable Patterns**: Impossible to game the system

### **Transparency**
- **Open Ticket Assignments**: All ticket ranges visible
- **Audit Trail**: Complete history of all draws
- **Verifiable Results**: Ticket numbers can be cross-referenced

### **Data Integrity**
- **Immediate Database Storage**: Winners saved instantly
- **Real-time Sync**: All sessions updated simultaneously
- **Backup Systems**: Export functionality for data preservation

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- Supabase account (for database)
- Modern web browser

### **Installation**
```bash
npm install
npm run dev
```

### **Supabase Setup**
1. Click "Connect to Supabase" in the application
2. Configure your Supabase project
3. Database tables will be created automatically

### **Running a Draw**
1. Login with admin credentials
2. Navigate to "Run Raffle" tab
3. Select prize category
4. Confirm draw parameters
5. Enjoy the magical drawing experience!

## 🎨 Design Philosophy

### **Glass Morphism Theme**
- Translucent backgrounds with backdrop blur
- Gradient overlays for depth
- Smooth animations and transitions

### **Celebration-First UX**
- Confetti animations for winner reveals
- Dramatic countdowns build suspense
- Emoji-rich interface creates joy

### **Professional Functionality**
- Enterprise-grade export capabilities
- Comprehensive audit trails
- Performance metric integration

## 🔮 Technical Highlights

### **State Management**
- React hooks for local state
- Supabase for persistent storage
- Real-time subscriptions for live updates

### **Animation System**
- Framer Motion for smooth transitions
- Canvas Confetti for celebrations
- Custom keyframe animations

### **Type Safety**
- Full TypeScript implementation
- Strict type checking
- Interface-driven development

## 📝 Data Models

### **Guide Interface**
```typescript
interface Guide {
  id: number;
  name: string;
  supervisor: string;
  department: string;
  nps: number;
  nrpc: number;
  refundPercent: number;
  totalTickets: number;
}
```

### **Winner Interface**
```typescript
interface PrizeWinner {
  id: string;
  guide_id: number;
  name: string;
  supervisor: string;
  department: string;
  nps: number;
  nrpc: number;
  refund_percent: number;
  total_tickets: number;
  won_at: string;
  prize_category: string;
  prize_name: string;
}
```

## 🎪 The Magic Behind the Scenes

This system transforms a simple raffle into an engaging, fair, and transparent experience. By combining performance-based ticket allocation with dramatic presentation, it ensures that:

- **Top performers have better chances** (more tickets)
- **Everyone has a fair shot** (random selection)
- **Results are verifiable** (transparent ticket system)
- **Experience is memorable** (celebration animations)

The weighted ticket system ensures that while luck plays a role, consistent high performance is rewarded, creating a perfect balance between fairness and merit-based recognition.

---

*✨ Imagined, Designed and Developed by Abhishekh Dey with ❤️*