document.addEventListener('DOMContentLoaded', function () {
  // Password Logic
  const PASSWORD = 'teszt';
  const storeNameContainer = document.getElementById('storeNameContainer');
  const passwordContainer = document.getElementById('passwordContainer');
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const passwordError = document.getElementById('passwordError');
  const contentWrapper = document.getElementById('contentWrapper');
  let isPasswordVisible = false;
  const sidebarContainer = document.getElementById('sidebarContainer');

  // Show sidebar when store name moves up
  storeNameContainer.addEventListener('click', function () {
    if (!isPasswordVisible && sessionStorage.getItem('siteAccess') !== 'granted') {
      // Your existing code...
      sidebarContainer.style.pointerEvents = 'auto'; // Enable sidebar interaction
    }
  });

  // Hide sidebar initially
  sidebarContainer.style.pointerEvents = 'none';

  // Show sidebar when authenticated
  if (sessionStorage.getItem('siteAccess') === 'granted') {
    sidebarContainer.style.pointerEvents = 'auto';
  }

  // Check existing access
  if (sessionStorage.getItem('siteAccess') === 'granted') {
    contentWrapper.style.display = 'block';
    storeNameContainer.classList.add('move-up');
    passwordContainer.style.display = 'none';
    document.body.classList.add('authenticated');
    document.documentElement.style.setProperty('--invert-filter', '100%');
    setTimeout(() => {
      loadProducts(); // Load products if access is already granted after a 500ms delay
    }, 500);
  }

  // Toggle password input on title click
  storeNameContainer.addEventListener('click', function () {
    if (!isPasswordVisible && sessionStorage.getItem('siteAccess') !== 'granted') {
      storeNameContainer.classList.add('move-up');
      sidebarContainer.style.pointerEvents = 'auto';
      setTimeout(() => {
        passwordContainer.classList.add('visible');
        passwordInput.focus();
      }, 250); // Match title animation duration

      isPasswordVisible = true;
    }
  });

  // Password validation
  function checkPassword() {
    if (passwordInput.value === PASSWORD) {
      sessionStorage.setItem('siteAccess', 'granted');
      passwordContainer.classList.remove('visible');
      contentWrapper.style.display = 'block';
      document.body.classList.add('authenticated');
      document.documentElement.style.setProperty('--invert-filter', '100%');
      setTimeout(() => {
        loadProducts(); // Load products after password is accepted with a slight buffer
      }, 500);
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
  function loadProducts() {
    fetch('/collections/all/products.json')
      .then((response) => response.json())
      .then((data) => {
        const products = data.products;

        if (products.length > 0) {
          // Create grid container with fade-in animation
          contentWrapper.innerHTML = `
            <div class="product-grid">
              ${products
                .map(
                  (product, index) => `
                <div class="product-card" style="animation-delay: ${index * 0.1}s">
                  <img src="${product.images[0]?.src || ''}" alt="${product.title}" class="product-image">
                  <div class="product-details">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">Ft ${Math.round(product.variants[0]?.price || 0).toLocaleString(
                      'en-US'
                    )}</p>
                    <button class="product-button" data-product-id="${
                      product.variants[0]?.id || ''
                    }">Add to Cart</button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
          initializeProductEventListeners();
        } else {
          contentWrapper.innerHTML = `<p class="error">No products available.</p>`;
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        contentWrapper.innerHTML = `<p class="error">Failed to load products. Please try again later.</p>`;
      });
  }

  function initializeProductEventListeners() {
    const buttons = document.querySelectorAll('.product-button');
    buttons.forEach((button) => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const productId = this.dataset.productId;
        if (productId) {
          addToCart(productId);
        }
      });
    });
  }

  // Cart Variables (ensure these elements exist in your sidebar HTML)
  let cart = null;
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const totalPrice = document.querySelector('.total-price');
  const checkoutButton = document.querySelector('.checkout-button');

  // Add event listener to checkout button
  if (checkoutButton) {
    checkoutButton.addEventListener('click', initiateCheckout);
  }

  // Function to fetch the cart data from Shopify
  async function fetchCart() {
    try {
      const response = await fetch('/cart.js');
      cart = await response.json();
      updateCartDisplay();
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  // Update the sidebar display for the cart
  function updateCartDisplay() {
    if (!cart) return;

    // Cart display snippet
    cartItemsContainer.innerHTML = cart.items
      .map(
        (item) => `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.product_title}</h4>
          <p class="cart-item-price">Ft ${Math.round(item.price / 100).toLocaleString('en-US')}</p>
          <div class="quantity-controls">
            <button class="quantity-decrease">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-increase">+</button>
          </div>
          <button class="remove-item">Remove</button>
        </div>
      </div>
    `
      )
      .join('');

    cartCount.textContent = `${cart.item_count} ${cart.item_count === 1 ? 'item' : 'items'}`;
    totalPrice.textContent = `Ft ${Math.round(cart.total_price / 100).toLocaleString('en-US')}`;

    // Attach event listeners for quantity changes
    document.querySelectorAll('.quantity-increase').forEach((button) => {
      button.addEventListener('click', updateQuantity);
    });

    document.querySelectorAll('.quantity-decrease').forEach((button) => {
      button.addEventListener('click', updateQuantity);
    });

    document.querySelectorAll('.remove-item').forEach((button) => {
      button.addEventListener('click', removeItem);
    });

    // Enable/disable checkout button based on cart contents
    if (checkoutButton) {
      checkoutButton.disabled = cart.item_count === 0;
    }
  }

  // Handle quantity update
  async function updateQuantity(e) {
    const cartItemEl = e.target.closest('.cart-item');
    const itemKey = cartItemEl.dataset.key;
    const currentQuantity = parseInt(cartItemEl.querySelector('.quantity-controls span').textContent);
    const newQuantity = e.target.classList.contains('quantity-increase') ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity < 1) return; // Prevent zero or negative

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemKey, quantity: newQuantity }),
      });

      cart = await response.json();
      updateCartDisplay();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  // Handle removal of an item
  async function removeItem(e) {
    const itemKey = e.target.closest('.cart-item').dataset.key;

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemKey, quantity: 0 }),
      });

      cart = await response.json();
      updateCartDisplay();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  // Modify your addToCart to update the cart display
  function addToCart(productId) {
    const formData = { items: [{ id: productId, quantity: 1 }] };

    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(() => {
        // Fetch the latest cart
        fetchCart();
        // Provide visual feedback on the button
        const button = document.querySelector(`[data-product-id="${productId}"]`);
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Added!';
          button.style.backgroundColor = 'var(--text-color)';
          button.style.color = 'var(--bg-color)';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
          }, 2000);
        }
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
        const button = document.querySelector(`[data-product-id="${productId}"]`);
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Error!';
          button.style.backgroundColor = '#ff6666';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }
      });
  }

  // Modify your checkout functionality:
  function initiateCheckout() {
    console.log('Checkout initiated!');
    if (checkoutButton) {
      checkoutButton.textContent = 'Processing...';
      checkoutButton.disabled = true;
    }
    // Use a slight delay to show the "Processing..." text before redirecting
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 300);
  }

  // Initialize cart if user is authenticated
  if (sessionStorage.getItem('siteAccess') === 'granted') {
    fetchCart();
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
