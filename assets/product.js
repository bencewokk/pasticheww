import { addToCart } from './cart.js';

export function loadProducts() {
  fetch('/collections/all/products.json')
    .then((response) => response.json())
    .then((data) => {
      const products = data.products;
      const contentWrapper = document.getElementById('contentWrapper');
      if (!products || products.length === 0) {
        contentWrapper.innerHTML = '<p>No product found.</p>';
        return;
      }
      const product = products[0];
      contentWrapper.innerHTML = `
        <div class="promo-product-layout dynamic-full">
          <div class="promo-center dynamic-promo">
            <img id="promoImage" src="" alt="Promo" class="promo-image dynamic-img" />
          </div>
          <div class="product-side dynamic-product">
            <div class="product single-product-view dynamic-product-view">
              <img src="${product.images[0]?.src || ''}" alt="${
        product.title
      }" class="product-image dynamic-img" style="width:100%;height:auto;">
              <h1 class="product-title">${product.title}</h1>
              <p class="product-price">Ft ${Math.round(product.variants[0]?.price || 0).toLocaleString('en-US')}</p>
              <div class="product-description">${product.body_html || ''}</div>
              <div class="product-form">
                <select name="id" class="variant-select">
                  ${product.variants
                    .map(
                      (variant) =>
                        `<option value="${variant.id}">${variant.title} - Ft ${Math.round(variant.price).toLocaleString(
                          'en-US'
                        )}</option>`
                    )
                    .join('')}
                </select>
                <input type="number" name="quantity" value="1" min="1" class="quantity-input">
                <button class="product-button" data-product-id="${product.variants[0]?.id || ''}">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      `;
      initializeProductEventListeners();
      initializePromoImageCycle();
    });
}

function initializeProductEventListeners() {
  const button = document.querySelector('.product-button');
  if (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const select = document.querySelector('.variant-select');
      const quantityInput = document.querySelector('.quantity-input');
      const productId = select ? select.value : button.dataset.productId;
      const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;
      if (productId) addToCart(productId, quantity);
    });
  }
}

function initializePromoImageCycle() {
  const promoImages = window.promoImages || [];
  let current = 0;
  const promoImageEl = document.getElementById('promoImage');
  if (!promoImageEl || promoImages.length === 0) return;
  promoImageEl.src = promoImages[0];
  setInterval(() => {
    current = (current + 1) % promoImages.length;
    promoImageEl.src = promoImages[current];
  }, 2500);
}
