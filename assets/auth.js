const PASSWORD = 'teszt';
const storeNameContainer = document.getElementById('storeNameContainer');
const passwordContainer = document.getElementById('passwordContainer');
const passwordInput = document.getElementById('passwordInput');
const passwordSubmit = document.getElementById('passwordSubmit');
const passwordError = document.getElementById('passwordError');
const contentWrapper = document.getElementById('contentWrapper');
const sidebarContainer = document.getElementById('sidebarContainer');
let isPasswordVisible = false;

export function initializeAuth(onSuccessCallback) {
  // When authenticated, swap logo to logodark.png
  if (sessionStorage.getItem('siteAccess') === 'granted') {
    const siteLogo = document.getElementById('siteLogo');
    if (siteLogo) siteLogo.src = siteLogo.src.replace('logo.png', 'logodark.png');
  }

  // Password validation
  function checkPassword() {
    if (passwordInput.value === PASSWORD) {
      sessionStorage.setItem('siteAccess', 'granted');
      passwordContainer.classList.remove('visible');
      contentWrapper.style.display = 'block';
      document.body.classList.add('authenticated');
      document.documentElement.style.setProperty('--invert-filter', '100%');
      // Swap logo to logodark.png
      const siteLogo = document.getElementById('siteLogo');
      if (siteLogo) siteLogo.src = siteLogo.src.replace('logo.png', 'logodark.png');
      onSuccessCallback();
    } else {
      passwordError.style.display = 'block';
      passwordError.classList.add('visible');
      passwordInput.value = '';
      passwordContainer.style.animation = 'shake 0.4s';
      setTimeout(() => (passwordContainer.style.animation = ''), 400);
    }
  }

  // Event listeners
  passwordSubmit.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && checkPassword());

  // Initial check
  if (sessionStorage.getItem('siteAccess') === 'granted') {
    contentWrapper.style.display = 'block';
    storeNameContainer.classList.add('move-up');
    passwordContainer.style.display = 'none';
    document.body.classList.add('authenticated');
    document.documentElement.style.setProperty('--invert-filter', '100%');
    onSuccessCallback();
  }

  // Title click handler
  storeNameContainer.addEventListener('click', () => {
    if (!isPasswordVisible && sessionStorage.getItem('siteAccess') !== 'granted') {
      storeNameContainer.classList.add('move-up');
      setTimeout(() => {
        passwordContainer.classList.add('visible');
        passwordInput.focus();
      }, 250);
      isPasswordVisible = true;
    }
  });
}
