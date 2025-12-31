const TYPING_CONFIG = {
	// 表示する文章リスト
	messages: [
		"UNITY / C#",
		"GAME DEVELOPMENT",
		"3D GRAPHICS",
		"OPTIMIZATION",
		"SHADER PROGRAMMING",
		"ゲーム開発",
		"プログラミング",
		"コードで夢を創る",
	],

	// 同時に表示する文字の数
	simultaneousTexts: 3,

	// 各テキストの開始遅延（ミリ秒）
	startDelay: 3000,

	// 1文字表示する速度（ミリ秒）
	typingSpeed: 100,

	// 全部表示されてから消えるまでの待機時間（ミリ秒）
	displayDuration: 2500,

	// フェードアウトの速度（ミリ秒）
	fadeOutDuration: 1500,

	// 消えてから次の文字が出るまでの待機時間（ミリ秒）
	pauseAfterErase: 800,

	// 角度の範囲（-rotation ~ +rotation 度）
	rotationRange: 30,
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
		textElement.style.opacity = "0.08"; // 初期透明度
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

		const top = Math.random() * 100;
		const left = Math.random() * 100;

		const rotation = (Math.random() - 0.5) * TYPING_CONFIG.rotationRange;

		const alignment = Math.random() > 0.5 ? "left" : "right";

		container.style.top = `${top}%`;
		container.style.left = `${left}%`;
		container.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
		container.style.textAlign = alignment;

		const textElement = document.createElement("div");
		textElement.className = "typing-text";
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
