function toggleBodyScroll(disable) {
	document.body.style.overflow = disable ? "hidden" : "";
}

function openSettingsModal() {
	const modal = document.getElementById("modal-settings");
	if (modal) {
		modal.classList.add("active");
		toggleBodyScroll(true);
	}
}

function closeSettingsModal() {
	const modal = document.getElementById("modal-settings");
	if (modal) {
		modal.classList.remove("active");
		toggleBodyScroll(false);
	}
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

const settingsBtn = document.getElementById("settings-btn");
if (settingsBtn) {
	settingsBtn.addEventListener("click", openSettingsModal);
}
