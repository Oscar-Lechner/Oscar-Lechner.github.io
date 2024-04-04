let images = ['wa11-img/image1.JPG', 'wa11-img/image2.JPG', 'wa11-img/image3.JPG', 'wa11-img/image4.JPG', 'wa11-img/image5.JPG', 'wa11-img/image6.JPG', 'wa11-img/image7.JPG'];
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
