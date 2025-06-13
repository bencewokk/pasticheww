import { initializeAuth } from './auth.js';
import { loadProducts } from './product.js'; // Note: your file is product.js not products.js
import { fetchCart } from './cart.js';
import { initializeParticles } from './particles.js';
import { initializeNewsletter } from './newsletter.js';
import { initializeSplitParticles } from './split-particles.js';
import { initializeProductSplit } from './product-split.js';

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
  } // Handle authentication if function exists
  if (typeof initializeAuth === 'function') {
    initializeAuth(() => {
      // Product loading disabled
      if (typeof fetchCart === 'function') fetchCart(); // Initialize split particles after authentication
      if (typeof initializeSplitParticles === 'function') {
        setTimeout(() => initializeSplitParticles(), 500);
      }

      // Initialize product split interactions
      if (typeof initializeProductSplit === 'function') {
        initializeProductSplit();
        console.log('Product split interactions initialized');
      }
    });
  } else {
    // Fallback if auth not available
    // Product loading disabled
    if (typeof fetchCart === 'function') fetchCart();
    if (typeof initializeSplitParticles === 'function') {
      setTimeout(() => initializeSplitParticles(), 500);
    }

    // Initialize product split interactions
    if (typeof initializeProductSplit === 'function') {
      initializeProductSplit();
      console.log('Product split interactions initialized');
    }
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
