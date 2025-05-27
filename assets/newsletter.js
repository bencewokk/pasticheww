// Newsletter subscription functionality
let isNewsletterVisible = false;
let hasSubscribed = false;

export function initializeNewsletter() {
  const newsletterContainer = document.getElementById('newsletterContainer');
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterSubmit = document.getElementById('newsletterSubmit');
  const newsletterSuccess = document.getElementById('newsletterSuccess');
  const newsletterError = document.getElementById('newsletterError');
  const skipNewsletter = document.getElementById('skipNewsletter');
  const storeNameContainer = document.getElementById('storeNameContainer');

  // Check if user has already subscribed or skipped
  if (sessionStorage.getItem('newsletterComplete') === 'true') {
    return; // Skip newsletter if already completed
  }

  // Show newsletter when logo is clicked (before password)
  storeNameContainer.addEventListener('click', () => {
    if (!isNewsletterVisible && sessionStorage.getItem('siteAccess') !== 'granted' && sessionStorage.getItem('newsletterComplete') !== 'true') {
      showNewsletter();
    }
  });

  function showNewsletter() {
    storeNameContainer.classList.add('move-up');
    setTimeout(() => {
      newsletterContainer.classList.add('visible');
      newsletterEmail.focus();
    }, 250);
    isNewsletterVisible = true;
  }

  function hideNewsletter() {
    newsletterContainer.classList.remove('visible');
    sessionStorage.setItem('newsletterComplete', 'true');
    isNewsletterVisible = false;
    
    // After newsletter, show password prompt
    setTimeout(() => {
      const passwordContainer = document.getElementById('passwordContainer');
      const passwordInput = document.getElementById('passwordInput');
      passwordContainer.classList.add('visible');
      passwordInput.focus();
    }, 300);
  }

  // Handle newsletter form submission
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = newsletterEmail.value.trim();
    
    // Basic email validation
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    try {
      newsletterSubmit.textContent = 'Subscribing...';
      newsletterSubmit.disabled = true;

      // Here you would typically send the email to your newsletter service
      // For now, we'll simulate a successful subscription
      await simulateSubscription(email);
      
      showSuccess('Thank you for subscribing!');
      hasSubscribed = true;
      
      setTimeout(() => {
        hideNewsletter();
      }, 2000);
      
    } catch (error) {
      showError('Subscription failed. Please try again.');
      newsletterSubmit.textContent = 'Subscribe';
      newsletterSubmit.disabled = false;
    }
  });

  // Handle skip newsletter
  skipNewsletter.addEventListener('click', () => {
    hideNewsletter();
  });

  function showSuccess(message) {
    newsletterSuccess.textContent = message;
    newsletterSuccess.classList.add('visible');
    newsletterError.classList.remove('visible');
  }

  function showError(message) {
    newsletterError.textContent = message;
    newsletterError.classList.add('visible');
    newsletterSuccess.classList.remove('visible');
    
    // Shake animation
    newsletterContainer.style.animation = 'shake 0.4s';
    setTimeout(() => {
      newsletterContainer.style.animation = '';
    }, 400);
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Simulate subscription (replace with real API call)
  async function simulateSubscription(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          console.log('Newsletter subscription:', email);
          resolve();
        } else {
          reject(new Error('Subscription failed'));
        }
      }, 1000);
    });
  }

  // Real newsletter integration example (uncomment and configure as needed):
  /*
  async function subscribeToNewsletter(email) {
    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'contact[email]': email,
          'contact[tags]': 'newsletter',
          'form_type': 'customer'
        })
      });
      
      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  */
}
