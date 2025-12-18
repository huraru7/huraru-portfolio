let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slide");
const slideInterval = 5000;

function showSlide(index) {
	if (index >= slides.length) {
		currentSlide = 0;
	} else if (index < 0) {
		currentSlide = slides.length - 1;
	} else {
		currentSlide = index;
	}

	// すべてのスライドを非表示
	slides.forEach((slide) => slide.classList.remove("active"));

	// 現在のスライドを表示
	slides[currentSlide].classList.add("active");
}

function nextSlide() {
	showSlide(currentSlide + 1);
}

// 自動スライド
let slideTimer = setInterval(nextSlide, slideInterval);

// スライドにマウスホバーで一時停止
const heroImage = document.querySelector(".hero-image");
if (heroImage) {
	heroImage.addEventListener("mouseenter", () => {
		clearInterval(slideTimer);
	});

	heroImage.addEventListener("mouseleave", () => {
		slideTimer = setInterval(nextSlide, slideInterval);
	});
}
