// Product split section interactions
export function initializeProductSplit() {
  // Handle size selection
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('size-btn')) {
      // Remove selected class from siblings
      const sizeButtons = e.target.parentElement.querySelectorAll('.size-btn');
      sizeButtons.forEach((btn) => btn.classList.remove('selected'));

      // Add selected class to clicked button
      e.target.classList.add('selected');
    }
  });

  // Handle buy button clicks
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('buy-btn')) {
      const productItem = e.target.closest('.product-item');
      const selectedSize = productItem.querySelector('.size-btn.selected');
      const productTitle = productItem.querySelector('.product-title').textContent;

      if (!selectedSize) {
        // Flash the size selector to indicate selection is required
        const sizeSelector = productItem.querySelector('.size-selector');
        sizeSelector.style.border = '2px solid #ff6666';
        sizeSelector.style.borderRadius = '4px';
        sizeSelector.style.padding = '0.5rem';

        setTimeout(() => {
          sizeSelector.style.border = '';
          sizeSelector.style.borderRadius = '';
          sizeSelector.style.padding = '';
        }, 1000);

        return;
      }

      // Simulate adding to cart
      const originalText = e.target.textContent;
      e.target.textContent = 'Added!';
      e.target.style.background = '#4CAF50';

      setTimeout(() => {
        e.target.textContent = originalText;
        e.target.style.background = '';
      }, 1500);

      console.log(`Added ${productTitle} - Size ${selectedSize.textContent} to cart`);
    }
  });
}
