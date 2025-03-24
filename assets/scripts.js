document.addEventListener('DOMContentLoaded', function () {
  // Password Logic
  const PASSWORD = 'YUNG2025';
  const storeNameContainer = document.getElementById('storeNameContainer');
  const passwordContainer = document.getElementById('passwordContainer');
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const passwordError = document.getElementById('passwordError');
  const contentWrapper = document.getElementById('contentWrapper');
  let isPasswordVisible = false;

  // Check existing access
  if (sessionStorage.getItem('siteAccess') === 'granted') {
    contentWrapper.style.display = 'block';
    storeNameContainer.classList.add('move-up');
    passwordContainer.style.display = 'none';
    loadProducts(); // Load products if access is already granted
  }

  // Toggle password input on title click
  storeNameContainer.addEventListener('click', function () {
    if (!isPasswordVisible && sessionStorage.getItem('siteAccess') !== 'granted') {
      storeNameContainer.classList.add('move-up');

      setTimeout(() => {
        passwordContainer.classList.add('visible');
        passwordInput.focus();
      }, 500); // Match title animation duration

      isPasswordVisible = true;
    }
  });

  // Password validation
  function checkPassword() {
    if (passwordInput.value === PASSWORD) {
      sessionStorage.setItem('siteAccess', 'granted');
      passwordContainer.classList.remove('visible');
      contentWrapper.style.display = 'block';
      loadProducts(); // Load products after password is accepted
    } else {
      passwordError.style.display = 'block';
      passwordError.classList.add('visible');
      passwordInput.value = '';

      // Error shake animation
      passwordContainer.style.animation = 'shake 0.4s';
      setTimeout(() => {
        passwordContainer.style.animation = '';
      }, 400);
    }
  }

  // Event listeners
  passwordSubmit.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
      checkPassword();
    }
  });

  // Add shake animation
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translate(-50%, -50%); }
      25% { transform: translate(-55%, -50%); }
      75% { transform: translate(-45%, -50%); }
    }
  `;
  document.head.appendChild(styleSheet);

  // Function to load store products
  function loadProducts() {
    fetch('/collections/all/products.json')
      .then((response) => response.json())
      .then((data) => {
        const products = data.products;

        if (products.length > 0) {
          const product = products[0]; // Get the first product

          // Generate HTML for the single product
          const productHTML = `
            <div class="product-focused">
              <img src="${product.images[0].src}" alt="${product.title}" class="product-image">
              <div class="product-details">
                <h2 class="product-title">${product.title}</h2>
                <p class="product-price">${product.variants[0].price}</p>
                <button class="product-button" data-product-id="${product.variants[0].id}">Add to Cart</button>
              </div>
            </div>
          `;

          // Insert product into the content wrapper
          contentWrapper.innerHTML = `
            <div class="container">
              ${productHTML}
            </div>
          `;
        } else {
          // If no products are found
          contentWrapper.innerHTML = `<p class="error">No products available.</p>`;
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        contentWrapper.innerHTML = `<p class="error">Failed to load products. Please try again later.</p>`;
      });
  }

  function addToCart(productId) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: productId, // Product variant ID
        quantity: 1, // Quantity to add
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Product added to cart!'); // Success message
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart. Please try again.'); // Error message
      });
  }

  // Particle System (unchanged from previous version)
  const storeNameFilled = document.getElementById('storeNameFilled');
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth <= 768;

  let cursorX = window.innerWidth / 2,
    cursorY = window.innerHeight / 2;
  let currentX = cursorX,
    currentY = cursorY;
  const easing = 0.2;

  let containerRect = storeNameContainer.getBoundingClientRect();
  let isOverTitle = false;
  let targetOpacity = 0;
  let currentOpacity = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    containerRect = storeNameContainer.getBoundingClientRect();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', function (e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    updateTitleInteraction();
  });

  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) {
      cursorX = e.touches[0].clientX;
      cursorY = e.touches[0].clientY;
      updateTitleInteraction();
    }
  });

  function updateTitleInteraction() {
    containerRect = storeNameContainer.getBoundingClientRect();
    isOverTitle =
      cursorX >= containerRect.left - 40 &&
      cursorX <= containerRect.right + 40 &&
      cursorY >= containerRect.top - 40 &&
      cursorY <= containerRect.bottom + 40;
    targetOpacity = isOverTitle ? 1 : 0;
  }

  function animate() {
    currentX += (cursorX - currentX) * easing;
    currentY += (cursorY - currentY) * easing;
    currentOpacity += (targetOpacity - currentOpacity) * 0.1;
    storeNameFilled.style.opacity = currentOpacity.toString();

    if (currentOpacity > 0.01) {
      updateSpotlight(currentX, currentY);
    }

    requestAnimationFrame(animate);
  }

  function updateSpotlight(x, y) {
    const relX = x - containerRect.left;
    const relY = y - containerRect.top;
    const spotlightSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--spotlight-size'));

    const gradient = `radial-gradient(
            circle ${spotlightSize}px at ${relX}px ${relY}px, 
            rgba(255, 255, 255, 1) 0%, 
            rgba(255, 255, 255, 0.9) 30%,
            rgba(255, 255, 255, 0.7) 50%, 
            rgba(255, 255, 255, 0.1) 70%,
            transparent 100%
          )`;

    storeNameFilled.style.background = gradient;
    storeNameFilled.style.webkitBackgroundClip = 'text';
    storeNameFilled.style.backgroundClip = 'text';
    storeNameFilled.style.webkitTextFillColor = 'transparent';
    storeNameFilled.style.color = 'transparent';
    storeNameFilled.style.maskImage = gradient;
    storeNameFilled.style.webkitMaskImage = gradient;
  }

  const particleCount =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--particle-count')) || (isMobile ? 40 : 80);
  const cursorInfluenceRadius =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cursor-influence-radius')) ||
    (isMobile ? 100 : 150);
  const cursorPushStrength =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cursor-push-strength')) || 0.5;
  const particleBaseOpacity =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--particle-base-opacity')) || 0.5;
  const particleMaxOpacity =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--particle-max-opacity')) || 1.0;
  const connectionBaseOpacity =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--connection-base-opacity')) || 0.2;
  const connectionMaxOpacity =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--connection-max-opacity')) || 0.6;

  const particles = [];

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        baseSpeedX: (Math.random() - 0.5) * 0.5,
        baseSpeedY: (Math.random() - 0.5) * 0.5,
        baseRadius: Math.random() * 2 + 1,
        opacity: particleBaseOpacity,
        connections: [],
      });
    }
  }

  function drawParticles() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - cursorX;
      const dy = p.y - cursorY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      p.speedX = p.speedX * 0.95 + p.baseSpeedX * 0.05;
      p.speedY = p.speedY * 0.95 + p.baseSpeedY * 0.05;
      p.opacity = p.opacity * 0.9 + particleBaseOpacity * 0.1;
      p.radius = p.radius * 0.9 + p.baseRadius * 0.1;

      if (distance < cursorInfluenceRadius) {
        const factor = 1 - distance / cursorInfluenceRadius;
        const pushFactor = factor * cursorPushStrength;

        if (distance > 0) {
          p.speedX += (dx / distance) * pushFactor;
          p.speedY += (dy / distance) * pushFactor;
          p.speedX += dy * 0.001 * pushFactor;
          p.speedY -= dx * 0.001 * pushFactor;
        }

        p.opacity = particleBaseOpacity + (particleMaxOpacity - particleBaseOpacity) * factor;
        p.radius = p.baseRadius + p.baseRadius * factor;
      }

      const maxSpeed = 2;
      const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
      if (currentSpeed > maxSpeed) {
        p.speedX = (p.speedX / currentSpeed) * maxSpeed;
        p.speedY = (p.speedY / currentSpeed) * maxSpeed;
      }

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fill();

      p.connections = [];
      for (let j = i + 1; j < particles.length; j++) {
        if (i === j) continue;

        const p2 = particles[j];
        const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

        if (distance < 100) {
          p.connections.push({
            particle: p2,
            distance: distance,
          });
        }
      }

      for (let conn of p.connections) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(conn.particle.x, conn.particle.y);

        const distanceOpacity = 1 - conn.distance / 100;
        const avgParticleOpacity = (p.opacity + conn.particle.opacity) / 2;
        const connectionBrightnessFactor =
          (avgParticleOpacity - particleBaseOpacity) / (particleMaxOpacity - particleBaseOpacity);
        const connectionOpacity =
          connectionBaseOpacity + (connectionMaxOpacity - connectionBaseOpacity) * connectionBrightnessFactor;

        ctx.strokeStyle = `rgba(255, 255, 255, ${distanceOpacity * connectionOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    requestAnimationFrame(drawParticles);
  }

  document.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches[0]) {
      cursorX = e.touches[0].clientX;
      cursorY = e.touches[0].clientY;
      updateTitleInteraction();
    }
  });

  initParticles();
  animate();
  drawParticles();

  window.addEventListener('resize', function () {
    resizeCanvas();
    initParticles();
  });
});

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('product-button')) {
    const productId = e.target.dataset.productId; // Get the product ID from the button
    addToCart(productId); // Call the addToCart function
  }
});
