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
