/**
 * Generate initials from a full name
 * Examples:
 * - "Rajesh Kumar" → "RK"
 * - "Mohit Aggarwal" → "MA"
 * - "Zoya Irfan" → "ZI"
 * - "John" → "J"
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === "") return "U";
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning ☀️";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon 🌤️";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening 🌇";
  } else {
    return "Good Night 🌙";
  }
};
