export function loadProducts() {
  fetch('/collections/all/products.json')
    .then((response) => response.json())
    .then((data) => {
      const products = data.products;
      const contentWrapper = document.getElementById('contentWrapper');

      if (products.length === 1) {
        // Single product: show card and description side by side
        const product = products[0];
        const images = product.images || [];
        const sizeButtons = product.variants
          .map(
            (variant) =>
              `<button class="product-size-btn" data-variant-id="${variant.id}"${
                variant.available ? '' : ' disabled style="opacity:0.5;cursor:not-allowed;"'
              }>${variant.title}${variant.available ? '' : ' (Out of stock)'}</button>`
          )
          .join('');
        contentWrapper.innerHTML = `
          <div class="product-flex-center">
            <div class="product-card" style="animation-delay: 0s">
              <div class="product-image-carousel">
                <button class="carousel-arrow carousel-arrow-left" style="display:${
                  images.length > 1 ? 'block' : 'none'
                }">&#8592;</button>
                <img src="${images[0]?.src || ''}" alt="${product.title}" class="product-image" data-index="0">
                <button class="carousel-arrow carousel-arrow-right" style="display:${
                  images.length > 1 ? 'block' : 'none'
                }">&#8594;</button>
              </div>
              <div class="product-details">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">Ft ${Math.round(product.variants[0]?.price || 0).toLocaleString('en-US')}</p>
                <div class="product-size-btn-group">${sizeButtons}</div>
                <button class="product-buy-now" style="display:none;" data-product-id="">Buy Now</button>
              </div>
            </div>
            <div class="product-description-side">
              <h4>Description</h4>
              <div>${product.body_html || ''}</div>
            </div>
          </div>
        `;
        // Carousel logic
        if (images.length > 1) {
          const imgEl = document.querySelector('.product-image');
          const leftBtn = document.querySelector('.carousel-arrow-left');
          const rightBtn = document.querySelector('.carousel-arrow-right');
          let currentIdx = 0;
          leftBtn.addEventListener('click', function () {
            currentIdx = (currentIdx - 1 + images.length) % images.length;
            imgEl.src = images[currentIdx].src;
            imgEl.setAttribute('data-index', currentIdx);
          });
          rightBtn.addEventListener('click', function () {
            currentIdx = (currentIdx + 1) % images.length;
            imgEl.src = images[currentIdx].src;
            imgEl.setAttribute('data-index', currentIdx);
          });
        }
        // Size button selection logic
        const sizeBtns = document.querySelectorAll('.product-size-btn');
        const buyNowBtn = document.querySelector('.product-buy-now');
        if (sizeBtns.length && buyNowBtn) {
          sizeBtns.forEach((btn) => {
            btn.addEventListener('click', function () {
              sizeBtns.forEach((b) => b.removeAttribute('data-selected'));
              this.setAttribute('data-selected', 'true');
              buyNowBtn.dataset.productId = this.dataset.variantId;
              buyNowBtn.style.display = 'block';
            });
          });
          // No size selected by default
          buyNowBtn.style.display = 'none';
          buyNowBtn.dataset.productId = '';
          buyNowBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const variantId = this.dataset.productId;
            if (variantId) {
              window.location.href = `/cart/${variantId}:1?checkout`;
            }
          });
        }
      } else {
        // Multiple products: show grid
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
      }

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
