// Toggle de navbar y profile (de tu script.js)
let navbar = document.querySelector('.header .flex .navbar');
let profile = document.querySelector('.header .flex .profile');

const menuBtn = document.querySelector('#menu-btn');
if (menuBtn && navbar && profile) {
  menuBtn.onclick = () => {
    navbar.classList.toggle('active');
    profile.classList.remove('active');
  }
}

const userBtn = document.querySelector('#user-btn');
if (userBtn && navbar && profile) {
  userBtn.onclick = () => {
    profile.classList.toggle('active');
    navbar.classList.remove('active');
  }
}

// Hide on scroll
window.onscroll = () => { 
  if (navbar) navbar.classList.remove('active');
  if (profile) profile.classList.remove('active');
};

// Switch de imágenes en quick-view (de tu script.js)
let mainImage = document.querySelector('.quick-view .box .row .image-container .main-image img');
let subImages = document.querySelectorAll('.quick-view .box .row .image-container .sub-image img');

subImages.forEach(images => {
  if (images) {
    images.onclick = () => {
      const src = images.getAttribute('src');
      if (mainImage) mainImage.src = src;
    }
  }
});

// Switch de videos en quick-view (de tu script.js)
let mainVideo = document.querySelector('.quick-view .box .row .video-container .main-video video');
let subVideos = document.querySelectorAll('.quick-view .box .row .video-container .sub-video video');

subVideos.forEach(video => {
  if (video) {
    video.onclick = () => {
      const src = video.getAttribute('src');
      if (mainVideo) mainVideo.src = src;
    }
  }
});

// Toggle theme y currency (de tu header.php script)
function toggleTheme() {
  const toggleThemeInput = document.getElementById('toggle-theme');
  if (!toggleThemeInput) return;
  const isDarkMode = toggleThemeInput.checked;
  const newTheme = isDarkMode ? 'dark' : 'light';
  document.body.className = newTheme;
  localStorage.setItem('theme', newTheme);
}

function toggleCurrency() {
  const togglePriceInput = document.getElementById('toggle-price');
  if (!togglePriceInput) return;
  const isUSD = togglePriceInput.checked;
  const currency = isUSD ? 'usd' : 'local';
  localStorage.setItem('currency', currency);
  const prices = document.querySelectorAll('.price span');
  const exchangeRate = 0.058; 
  prices.forEach(price => {
    const originalPrice = parseFloat(price.getAttribute('data-original-price'));
    if (!isNaN(originalPrice)) { 
      if (currency === 'usd') {
        price.textContent = `$${(originalPrice * exchangeRate).toFixed(2)} USD`;
      } else {
        price.textContent = `${originalPrice.toFixed(2)} MXN`;
      }
    }
  });
}

// DOMContentLoaded para cargar todo
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light'; 
  document.body.className = savedTheme;
  const toggleThemeInput = document.getElementById('toggle-theme');
  if (toggleThemeInput) {
    toggleThemeInput.checked = savedTheme === 'dark';
    toggleThemeInput.addEventListener('change', toggleTheme);
  }

  const savedCurrency = localStorage.getItem('currency') || 'local'; 
  const togglePriceInput = document.getElementById('toggle-price');
  if (togglePriceInput) {
    togglePriceInput.checked = savedCurrency === 'usd';
    togglePriceInput.addEventListener('change', toggleCurrency);
    toggleCurrency(); 
  }
});