let images = ['wa11-img/image1.JPG', 'wa11-img/image2.JPG', 'wa11-img/image3.JPG', 'wa11-img/image4.JPG', 'wa11-img/image5.JPG', 'wa11-img/image6.JPG', 'wa11-img/image7.JPG'];
let currentIndex = 0;

function changeImage(index) {
    document.getElementById("mainImage").src = images[index];
    currentIndex = index;
    updateThumbnails();
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    changeImage(currentIndex);
}

function previousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    changeImage(currentIndex);
}

function updateThumbnails() {
    let thumbnailContainer = document.querySelector('.thumbnail-container');
    let thumbnails = thumbnailContainer.querySelectorAll('.thumbnail');

    // Reset active class for all thumbnails
    thumbnails.forEach(thumbnail => thumbnail.classList.remove('active'));

    // Set active class for the current thumbnail
    let currentThumbnail = thumbnails[currentIndex];
    if (currentThumbnail) {
        currentThumbnail.classList.add('active');
    }

    // Update thumbnail positions
    for (let i = 0; i < thumbnails.length; i++) {
        let thumbnailIndex = (currentIndex + i) % images.length;
        thumbnails[i].src = images[thumbnailIndex];
    }
}

function toggleMode() {
    let body = document.body;
    body.classList.toggle('dark-mode');

    let thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.classList.toggle('dark-thumbnail');
    });
}

// Initialize the carousel
changeImage(currentIndex);