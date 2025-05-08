export function loadProducts() {
  fetch('/collections/all/products.json')
    .then((response) => response.json())
    .then((data) => {
      const products = data.products;
      const contentWrapper = document.getElementById('contentWrapper');

      contentWrapper.innerHTML = `
          <div class="product-grid">
            ${products
              .map(
                (product, index) => `
              <div class="product-card" style="animation-delay: ${index * 0.1}s">
                <img src="${product.images[0]?.src || ''}" alt="${product.title}" class="product-image">
                <div class="product-details">
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">Ft ${Math.round(product.variants[0]?.price || 0).toLocaleString('en-US')}</p>
                  <button class="product-button" data-product-id="${product.variants[0]?.id || ''}">Add to Cart</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `;

      initializeProductEventListeners();
    });
}

function initializeProductEventListeners() {
  document.querySelectorAll('.product-button').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      if (productId) addToCart(productId);
    });
  });
}
