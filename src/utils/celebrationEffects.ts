// Celebration effects utilities

export const triggerCelebration = () => {
  // Create confetti effect using CSS animations
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    createConfetti(colors[Math.floor(Math.random() * colors.length)]);
  }
};

const createConfetti = (color: string) => {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * window.innerWidth + 'px';
  confetti.style.top = '-10px';
  confetti.style.opacity = '1';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  confetti.style.borderRadius = '50%';
  
  document.body.appendChild(confetti);
  
  const duration = 2000 + Math.random() * 1000;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;
    
    if (progress < 1) {
      confetti.style.top = (progress * window.innerHeight) + 'px';
      confetti.style.opacity = String(1 - progress);
      confetti.style.transform = `rotate(${progress * 360}deg)`;
      requestAnimationFrame(animate);
    } else {
      confetti.remove();
    }
  };
  
  animate();
};

export const getEncouragingMessage = (completed: number, total: number): string => {
  const percentage = (completed / total) * 100;
  
  if (percentage === 100) {
    return "🎉 Amazing! You completed everything!";
  } else if (percentage >= 75) {
    return `Excellent! Just ${total - completed} more to go!`;
  } else if (percentage >= 50) {
    return `Great progress! Keep going!`;
  } else if (percentage >= 25) {
    return `You're doing great! ${completed} down!`;
  } else if (completed > 0) {
    return `Good start! Keep building momentum!`;
  }
  
  return "Let's get started on your day!";
};
