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
});
