(function () {
	let currentSlide = 0;
	const slides = document.querySelectorAll(".hero-slide");
	const INTERVAL = 5000;

	function showSlide(index) {
		currentSlide = index >= slides.length ? 0 : index < 0 ? slides.length - 1 : index;
		slides.forEach((slide) => slide.classList.remove("active"));
		slides[currentSlide].classList.add("active");
	}

	let timer = setInterval(() => showSlide(currentSlide + 1), INTERVAL);

	const heroImage = document.querySelector(".hero-image");
	if (heroImage) {
		heroImage.addEventListener("mouseenter", () => clearInterval(timer));
		heroImage.addEventListener("mouseleave", () => {
			timer = setInterval(() => showSlide(currentSlide + 1), INTERVAL);
		});
	}
})();
