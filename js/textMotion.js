const messages = [
	"Never-Ending Creating",
	"Hello! 2026!",
	"Hello World!!",
	"The longing won't stop",
	"Creating the world",
	"huraru7.github.io",
	"In search of the future...",
	"Embrace the unknown",
	"Code is poetry",
	"Dream, Code, Repeat",
	"Crafting digital dreams",
	"Designing the future",
	"Exploring endless",
	"Antigravity",
];

messages.push(`This text is displayed at ${((1 / (messages.length + 1)) * 100).toFixed(1)}%`);

const TYPING_CONFIG = {
	messages,
	simultaneousTexts: 3,
	startDelay: 1000,
	typingSpeed: 90,
	displayDuration: 2500,
	fadeOutDuration: 1500,
	pauseAfterErase: 750,
	rotationRange: 45,
};

function createTypingText() {
	for (let i = 0; i < TYPING_CONFIG.simultaneousTexts; i++) {
		setTimeout(() => startTypingLoop(TYPING_CONFIG.messages), i * TYPING_CONFIG.startDelay);
	}
}

function startTypingLoop(messages) {
	let currentIndex = Math.floor(Math.random() * messages.length);

	function typeText(textElement, text, callback) {
		textElement.textContent = "";
		textElement.style.opacity = "0.2";
		let charIndex = 0;

		const typingInterval = setInterval(() => {
			if (charIndex < text.length) {
				textElement.textContent += text[charIndex];
				charIndex++;
			} else {
				clearInterval(typingInterval);
				setTimeout(callback, TYPING_CONFIG.displayDuration);
			}
		}, TYPING_CONFIG.typingSpeed);
	}

	function fadeOutText(textElement, callback) {
		let opacity = 0.08;
		const fadeStep = 0.08 / (TYPING_CONFIG.fadeOutDuration / 50);

		const fadingInterval = setInterval(() => {
			opacity -= fadeStep;
			if (opacity <= 0) {
				clearInterval(fadingInterval);
				textElement.style.opacity = "0";
				setTimeout(callback, TYPING_CONFIG.pauseAfterErase);
			} else {
				textElement.style.opacity = opacity.toString();
			}
		}, 50);
	}

	function createNewTextElement() {
		const container = document.createElement("div");
		container.className = "typing-text-container";

		const top = Math.random() * 100;
		const left = Math.random() * 100;
		const rotation = (Math.random() - 0.5) * TYPING_CONFIG.rotationRange;
		const alignment = Math.random() > 0.5 ? "left" : "right";

		container.style.position = "fixed";
		container.style.top = `${top}%`;

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

	function loop() {
		const { container, textElement } = createNewTextElement();

		typeText(textElement, messages[currentIndex], () => {
			fadeOutText(textElement, () => {
				container.remove();
				currentIndex = (currentIndex + 1) % messages.length;
				loop();
			});
		});
	}

	loop();
}

document.addEventListener("DOMContentLoaded", createTypingText);
