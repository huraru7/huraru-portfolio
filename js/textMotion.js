const TYPING_CONFIG = {
	// 表示する文章リスト
	messages: ["Never-Ending Creating", "Hello! 2026!", "Happy new year!", "Creating the world", "huraru7.github.io"],

	// 同時に表示する文章の数
	simultaneousTexts: 4,

	// 各テキストの開始遅延（ms）
	startDelay: 1000,

	// 1文章表示する速度（ms）
	typingSpeed: 90,

	// 全部表示されてから消えるまでの待機時間（ms）
	displayDuration: 2500,

	// フェードアウトの速度（ms）
	fadeOutDuration: 1500,

	// 消えてから次の文章が出るまでの待機時間（ms）
	pauseAfterErase: 750,

	// 角度の範囲（-rotation ~ +rotation 度）
	rotationRange: 45,
};

function createTypingText() {
	for (let i = 0; i < TYPING_CONFIG.simultaneousTexts; i++) {
		setTimeout(() => {
			startTypingLoop(TYPING_CONFIG.messages);
		}, i * TYPING_CONFIG.startDelay);
	}
}

function startTypingLoop(messages) {
	let currentIndex = Math.floor(Math.random() * messages.length);

	// 1文字ずつ表示する関数
	function typeText(textElement, text, callback) {
		textElement.textContent = "";
		textElement.style.opacity = "0.2"; // 初期透明度
		let charIndex = 0;

		const typingInterval = setInterval(() => {
			if (charIndex < text.length) {
				textElement.textContent += text[charIndex];
				charIndex++;
			} else {
				clearInterval(typingInterval);
				// 全部表示されたら待機
				setTimeout(callback, TYPING_CONFIG.displayDuration);
			}
		}, TYPING_CONFIG.typingSpeed);
	}

	// フェードアウトで消す関数
	function fadeOutText(textElement, callback) {
		let opacity = 0.08;
		const fadeStep = 0.08 / (TYPING_CONFIG.fadeOutDuration / 50);

		const fadingInterval = setInterval(() => {
			opacity -= fadeStep;
			if (opacity <= 0) {
				opacity = 0;
				clearInterval(fadingInterval);
				textElement.style.opacity = "0";

				setTimeout(callback, TYPING_CONFIG.pauseAfterErase);
			} else {
				textElement.style.opacity = opacity.toString();
			}
		}, 50);
	}

	// 新しいテキスト要素を作成
	function createNewTextElement() {
		const container = document.createElement("div");
		container.className = "typing-text-container";

		// ランダムな位置（0%から100%）
		const top = Math.random() * 100;
		const left = Math.random() * 100;

		// ランダムな角度
		const rotation = (Math.random() - 0.5) * TYPING_CONFIG.rotationRange;

		// ランダムに左寄せか右寄せ
		const alignment = Math.random() > 0.5 ? "left" : "right";

		container.style.position = "fixed";
		container.style.top = `${top}%`;

		// 左寄せか右寄せで配置方法を変える
		if (alignment === "left") {
			container.style.left = `${left}%`;
			container.style.right = "auto";
			container.style.transformOrigin = "left top";
		} else {
			container.style.right = `${100 - left}%`;
			container.style.left = "auto";
			container.style.transformOrigin = "right top";
		}

		container.style.transform = `rotate(${rotation}deg)`;

		const textElement = document.createElement("div");
		textElement.className = "typing-text";
		textElement.style.textAlign = alignment;
		container.appendChild(textElement);

		document.body.appendChild(container);

		return { container, textElement };
	}

	//ループ処理
	function loop() {
		const currentMessage = messages[currentIndex];
		const { container, textElement } = createNewTextElement();

		typeText(textElement, currentMessage, () => {
			fadeOutText(textElement, () => {
				container.remove();
				currentIndex = (currentIndex + 1) % messages.length;
				loop();
			});
		});
	}

	loop();
}

document.addEventListener("DOMContentLoaded", () => {
	createTypingText();
});
