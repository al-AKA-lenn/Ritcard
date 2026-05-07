export function generateProfile(username) {
  // Gunakan logik hash dari index.js untuk data deterministik
  const seed = username.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  
  return {
    username,
    rank: Math.abs(seed % 1500) + 1,
    level: Math.abs(seed % 80) + 1,
    messages: Math.abs(seed % 9900) + 100,
    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`
  };
}