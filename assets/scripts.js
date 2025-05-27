import { initializeAuth } from './auth.js';
import { loadProducts } from './product.js'; // Note: your file is product.js not products.js
import { fetchCart } from './cart.js';
import { initializeParticles } from './particles.js';
import { initializeNewsletter } from './newsletter.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components in the correct order
  if (typeof initializeParticles === 'function') {
    initializeParticles();
    console.log('Particles initialized');
  }

  // Initialize newsletter functionality
  if (typeof initializeNewsletter === 'function') {
    initializeNewsletter();
    console.log('Newsletter initialized');
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

  // Dynamically load git info for the footer
  fetch('{{ "gitinfo.json" | asset_url }}')
    .then((res) => res.json())
    .then((data) => {
      const footer = document.querySelector('.footer-minimal');
      if (footer && data.hash && data.date) {
        footer.innerHTML = `Commit: ${data.hash} · ${data.date}`;
      }
    });
});
