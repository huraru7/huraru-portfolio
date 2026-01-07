function openModal(projectId) {
	const modal = document.getElementById("modal-" + projectId);
	modal.classList.add("active");
	document.body.style.overflow = "hidden"; // スクロール防止
}

function closeModal(projectId) {
	const modal = document.getElementById("modal-" + projectId);
	modal.classList.remove("active");
	document.body.style.overflow = ""; // スクロール復元
}

// ESCキーでモーダルを閉じる
document.addEventListener("keydown", function (event) {
	if (event.key === "Escape") {
		const activeModal = document.querySelector(".modal.active");
		if (activeModal) {
			activeModal.classList.remove("active");
			document.body.style.overflow = "";
		}
	}
});

// ========== Q&Aモーダル ==========
const aboutMoreBtn = document.getElementById("aboutMoreBtn");
const qaModal = document.getElementById("modal-qa");

if (aboutMoreBtn && qaModal) {
	aboutMoreBtn.addEventListener("click", () => {
		qaModal.classList.add("active");
		document.body.style.overflow = "hidden";
	});
}

function closeQAModal() {
	const qaModal = document.getElementById("modal-qa");
	if (qaModal) {
		qaModal.classList.remove("active");
		document.body.style.overflow = "";
	}
}

// ESCキーでQ&Aモーダルも閉じる
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		const qaModal = document.getElementById("modal-qa");
		if (qaModal && qaModal.classList.contains("active")) {
			closeQAModal();
		}
	}
});
