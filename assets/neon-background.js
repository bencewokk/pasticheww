// Interactive neon green background for right split section
export function initializeNeonBackground() {
  const rightSection = document.querySelector('.split-right');
  if (!rightSection) return;

  let mouseX = 0;
  let mouseY = 0;
  let trails = [];

  // Create canvas for dynamic effects
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  rightSection.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const rect = rightSection.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  // Mouse move handler
  rightSection.addEventListener('mousemove', (e) => {
    const rect = rightSection.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Add minimal trail point
    trails.push({
      x: mouseX,
      y: mouseY,
      life: 1.0,
      size: 2
    });

    // Shorter trail length
    if (trails.length > 8) {
      trails.shift();
    }
  });
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simple cursor glow
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 40);
    gradient.addColorStop(0, 'rgba(0, 255, 127, 0.2)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple trails
    trails.forEach((trail, index) => {
      const alpha = trail.life * 0.4;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(0, 255, 127)`;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fill();

      // Faster decay for minimal trail
      trail.life -= 0.08;
      if (trail.life <= 0) {
        trails.splice(index, 1);
      }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  // Simple click effect
  rightSection.addEventListener('click', (e) => {
    const rect = rightSection.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Minimal explosion effect
    for (let i = 0; i < 6; i++) {
      trails.push({
        x: clickX + (Math.random() - 0.5) * 30,
        y: clickY + (Math.random() - 0.5) * 30,
        life: 1.2,
        size: 3
      });
    }
  });

  // Initialize
  resizeCanvas();
  animate();

  // Handle resize
  window.addEventListener('resize', resizeCanvas);
}
