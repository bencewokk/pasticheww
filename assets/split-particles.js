// Split particles system for both sides
export function initializeSplitParticles() {
  const leftSection = document.querySelector('.split-left');
  const rightSection = document.querySelector('.split-right');
  
  if (!leftSection || !rightSection) return;

  // Initialize particles for left section (Miami colors)
  initializeParticlesForSection(leftSection, {
    colors: ['rgba(255, 0, 128, 0.8)', 'rgba(0, 255, 255, 0.8)'],
    particleCount: 15,
    connectionColor: 'rgba(255, 0, 128, 0.3)'
  });

  // Initialize particles for right section (Matrix colors)
  initializeParticlesForSection(rightSection, {
    colors: ['rgba(0, 255, 127, 0.8)', 'rgba(57, 255, 20, 0.8)'],
    particleCount: 15,
    connectionColor: 'rgba(0, 255, 127, 0.3)'
  });
}

function initializeParticlesForSection(section, config) {
  // Create canvas for this section
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  section.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = [];
  
  let mouseX = 0;
  let mouseY = 0;
  const cursorInfluenceRadius = 100;
  const cursorPushStrength = 0.3;

  function resizeCanvas() {
    const rect = section.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    initParticles();
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        baseSpeedX: (Math.random() - 0.5) * 0.5,
        baseSpeedY: (Math.random() - 0.5) * 0.5,
        baseRadius: Math.random() * 2 + 1,
        opacity: 0.5,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        connections: []
      });
    }
  }

  // Mouse tracking for this section
  section.addEventListener('mousemove', function(e) {
    const rect = section.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Reset to base movement
      p.speedX = p.speedX * 0.95 + p.baseSpeedX * 0.05;
      p.speedY = p.speedY * 0.95 + p.baseSpeedY * 0.05;
      p.opacity = p.opacity * 0.9 + 0.5 * 0.1;
      p.radius = p.radius * 0.9 + p.baseRadius * 0.1;

      // Mouse influence
      if (distance < cursorInfluenceRadius) {
        const factor = 1 - distance / cursorInfluenceRadius;
        const pushFactor = factor * cursorPushStrength;

        if (distance > 0) {
          p.speedX += (dx / distance) * pushFactor;
          p.speedY += (dy / distance) * pushFactor;
        }

        p.opacity = 0.5 + (1.0 - 0.5) * factor;
        p.radius = p.baseRadius + p.baseRadius * factor;
      }

      // Speed limiting
      const maxSpeed = 2;
      const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
      if (currentSpeed > maxSpeed) {
        p.speedX = (p.speedX / currentSpeed) * maxSpeed;
        p.speedY = (p.speedY / currentSpeed) * maxSpeed;
      }

      // Update position
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw particle
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Find connections
      p.connections = [];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

        if (distance < 80) {
          p.connections.push({
            particle: p2,
            distance: distance
          });
        }
      }

      // Draw connections
      for (let conn of p.connections) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(conn.particle.x, conn.particle.y);

        const distanceOpacity = 1 - conn.distance / 80;
        const avgParticleOpacity = (p.opacity + conn.particle.opacity) / 2;
        const connectionOpacity = 0.2 + 0.4 * avgParticleOpacity;

        ctx.globalAlpha = distanceOpacity * connectionOpacity;
        ctx.strokeStyle = config.connectionColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(drawParticles);
  }

  // Initialize
  resizeCanvas();
  drawParticles();

  // Handle resize
  window.addEventListener('resize', resizeCanvas);
}
