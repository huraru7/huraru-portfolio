export function toggleBodyScroll(disable) {
	document.body.style.overflow = disable ? "hidden" : "";
}

export function openModal(projectId) {
	const modal = document.getElementById("modal-" + projectId);
	modal.classList.add("active");
	toggleBodyScroll(true);
}

export function closeModal(projectId) {
	const modal = document.getElementById("modal-" + projectId);
	modal.classList.remove("active");
	toggleBodyScroll(false);
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
