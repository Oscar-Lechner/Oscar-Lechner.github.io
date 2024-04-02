let images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg'];
let currentIndex = 0;

function changeImage(src) {
    document.getElementById("mainImage").src = src;
    currentIndex = images.indexOf(src);
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    changeImage(images[currentIndex]);
}

function previousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    changeImage(images[currentIndex]);
}
