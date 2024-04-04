const currentImage = document.querySelector('#mainImage');
const thumbnails = document.querySelectorAll('.thumbnail');
const modal = document.querySelector('.modal');
const modalImage = document.querySelector('.modal-image');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const toggleButton = document.querySelector('.toggle-button');

let currentIndex = 0;
const images = ['wa11-img/image1.JPG', 'wa11-img/image2.JPG', 'wa11-img/image3.JPG', 'wa11-img/image4.JPG', 'wa11-img/image5.JPG', 'wa11-img/image6.JPG', 'wa11-img/image7.JPG'];

// Set the initial image
currentImage.src = images[currentIndex];

// Update thumbnail styles
function updateThumbnails() {
  thumbnails.forEach((thumbnail, index) => {
    if (index === currentIndex) {
      thumbnail.classList.add('active');
    } else {
      thumbnail.classList.remove('active');
    }
  });
}

// Show the next image
function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  currentImage.src = images[currentIndex];
  updateThumbnails();
}

// Show the previous image
function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  currentImage.src = images[currentIndex];
  updateThumbnails();
}

// Handle thumbnail clicks
thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener('click', () => {
    currentIndex = index;
    currentImage.src = images[currentIndex];
    updateThumbnails();
  });
});

// Handle arrow button clicks
prevButton.addEventListener('click', prevImage);
nextButton.addEventListener('click', nextImage);

// Toggle dark mode
function toggleMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('dark-green-beige');
  thumbnails.forEach(thumbnail => thumbnail.classList.toggle('dark-thumbnail'));
}

// Initialize the gallery
updateThumbnails();