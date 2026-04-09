// 50 motivational messages — shown daily (dayOfYear % 50).
// Keep them short, warm, and couple-focused.

export const MESSAGES = [
  "Rest is where growth happens.",
  "Together you're unstoppable.",
  "Small steps, big strides.",
  "Recovery is training too.",
  "Show up for each other, every day.",
  "Strong bodies, stronger bond.",
  "Your best performance starts tonight.",
  "Move together, grow together.",
  "Sleep is your secret weapon.",
  "Two hearts, one goal.",
  "Consistency beats intensity.",
  "Rest days are win days.",
  "You're each other's best coach.",
  "Progress is a team sport.",
  "Even rest is momentum.",
  "HRV up. Game on.",
  "Push each other. Lift each other.",
  "The best warmup? Knowing your partner's got your back.",
  "Good sleep is an act of love.",
  "You're not competing — you're co-creating.",
  "Every stride brings you closer.",
  "Recovery score high? Crush it today.",
  "Fueled by love, driven by data.",
  "The couple that trains together, gains together.",
  "Your body remembers every effort.",
  "Rest deeply. Run freely.",
  "Hard days make the good days glow.",
  "Your HRV tells a story. Make it a good one.",
  "Side by side, rep by rep.",
  "The best PRs come from the best rest.",
  "You're in this for the long run — literally.",
  "Healthy habits, happy relationship.",
  "Strong sleep, strong day.",
  "Motion is medicine. Share it.",
  "Cheer each other across every finish line.",
  "You're building something that lasts.",
  "Train hard. Recover harder.",
  "Your effort compounds, just like love.",
  "Green rings mean go. Red rings mean rest — together.",
  "The data doesn't lie. Neither does your dedication.",
  "Lift each other up. In and out of the gym.",
  "Today's rest is tomorrow's performance.",
  "Shared goals, shared glory.",
  "The best accountability partner lives with you.",
  "Keep moving. Keep loving.",
  "Sleep like athletes. Wake like champions.",
  "Your heart rate syncs when you're together.",
  "Every step counts. Every rest counts more.",
  "Health is the greatest gift you give each other.",
  "Another day stronger. Another day closer.",
];

export function getTodayMessage() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MESSAGES[dayOfYear % MESSAGES.length];
}
