function toggleBodyScroll(disable) {
	document.body.style.overflow = disable ? "hidden" : "";
}

function openModal(projectId) {
	const modal = document.getElementById("modal-" + projectId);
	modal.classList.add("active");
	toggleBodyScroll(true);
}

function closeModal(projectId) {
	const modal = document.getElementById("modal-" + projectId);
	modal.classList.remove("active");
	toggleBodyScroll(false);
}

function closeQAModal() {
	const qaModal = document.getElementById("modal-qa");
	if (qaModal) {
		qaModal.classList.remove("active");
		toggleBodyScroll(false);
	}
}

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		const activeModal = document.querySelector(".modal.active");
		if (activeModal) {
			activeModal.classList.remove("active");
			toggleBodyScroll(false);
		}
	}
});

const aboutMoreBtn = document.getElementById("aboutMoreBtn");
const qaModal = document.getElementById("modal-qa");

if (aboutMoreBtn && qaModal) {
	aboutMoreBtn.addEventListener("click", () => {
		qaModal.classList.add("active");
		toggleBodyScroll(true);
	});
}
