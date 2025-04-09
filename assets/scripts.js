import { initializeAuth } from './auth.js';
import { loadProducts } from './product.js'; // Note: your file is product.js not products.js
import { fetchCart } from './cart.js';
import { initializeParticles } from './particles.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeParticles();
  console.log('Particles initialized');

  initializeAuth(() => {
    loadProducts();
    fetchCart();
  });

  if (sessionStorage.getItem('siteAccess') === 'granted') {
    document.querySelector('.sidebar-container').style.pointerEvents = 'auto';
  }
});
