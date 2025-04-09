let cart = null;
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const totalPrice = document.querySelector('.total-price');
const checkoutButton = document.querySelector('.checkout-button');

export async function fetchCart() {
  try {
    const response = await fetch('/cart.js');
    cart = await response.json();
    updateCartDisplay();
  } catch (error) {
    console.error('Error fetching cart:', error);
  }
}

export function addToCart(productId) {
  const formData = { items: [{ id: productId, quantity: 1 }] };

  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then(() => {
      fetchCart();
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

function updateCartDisplay() {
  if (!cart) return;

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

  document.querySelectorAll('.quantity-increase').forEach((button) => {
    button.addEventListener('click', updateQuantity);
  });

  document.querySelectorAll('.quantity-decrease').forEach((button) => {
    button.addEventListener('click', updateQuantity);
  });

  document.querySelectorAll('.remove-item').forEach((button) => {
    button.addEventListener('click', removeItem);
  });

  if (checkoutButton) {
    checkoutButton.disabled = cart.item_count === 0;
  }
}

async function updateQuantity(e) {
  const cartItemEl = e.target.closest('.cart-item');
  const itemKey = cartItemEl.dataset.key;
  const currentQuantity = parseInt(cartItemEl.querySelector('.quantity-controls span').textContent);
  const newQuantity = e.target.classList.contains('quantity-increase') ? currentQuantity + 1 : currentQuantity - 1;

  if (newQuantity < 1) return;

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

if (checkoutButton) {
  checkoutButton.addEventListener('click', function () {
    checkoutButton.textContent = 'Processing...';
    checkoutButton.disabled = true;
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 300);
  });
}
