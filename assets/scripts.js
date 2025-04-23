import { initializeAuth } from './auth.js';
import { loadProducts } from './product.js'; // Note: your file is product.js not products.js
import { fetchCart } from './cart.js';
import { initializeParticles } from './particles.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components in the correct order
  if (typeof initializeParticles === 'function') {
    initializeParticles();
    console.log('Particles initialized');
  }

  // Handle authentication if function exists
  if (typeof initializeAuth === 'function') {
    initializeAuth(() => {
      if (typeof loadProducts === 'function') loadProducts();
      if (typeof fetchCart === 'function') fetchCart();
    });
  } else {
    // Fallback if auth not available
    if (typeof loadProducts === 'function') loadProducts();
    if (typeof fetchCart === 'function') fetchCart();
  }

  if (sessionStorage.getItem('siteAccess') === 'granted') {
    const sidebarContainer = document.querySelector('.sidebar-container');
    if (sidebarContainer) sidebarContainer.style.pointerEvents = 'auto';
  }

  // Add mobile menu elements if they don't exist already
  if (!document.querySelector('.mobile-menu-toggle')) {
    // Create mobile menu toggle button
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '☰';
    document.body.appendChild(mobileMenuToggle);

    // Create mobile menu overlay
    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    document.body.appendChild(mobileMenuOverlay);

    // Toggle mobile menu function
    function toggleMobileMenu() {
      document.body.classList.toggle('mobile-menu-active');
    }

    // Event listeners
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
  }

  // Close menu when clicking a link (optional)
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        document.body.classList.remove('mobile-menu-active');
      }
    });
  });

  // Handle window resize
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      document.body.classList.remove('mobile-menu-active');
    }
  });
});
