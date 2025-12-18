function createGlitchDots() {
	const dotsContainer = document.createElement("div");

	dotsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;

	// 複数の種類のドットを生成
	for (let i = 0; i < 20; i++) {
		const dot = document.createElement("div");
		const size = Math.random() > 0.6 ? 6 : 3;
		const colors = ["#407ec5ff", "#6d64f4ff", "#e495faff", "#009ed3ff"];
		const color = colors[Math.floor(Math.random() * colors.length)];
		const duration = 2 + Math.random() * 5;
		const delay = Math.random() * 2;

		dot.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${Math.random() > 0.3 ? "50%" : "0"};
            opacity: 0;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: glitchFloat ${duration}s infinite ease-in-out ${delay}s,glitchFade ${duration}s infinite ease-in-out ${delay}s;
            box-shadow: 0 0 10px ${color};
        `;
		dotsContainer.appendChild(dot);
	}

	document.body.appendChild(dotsContainer);
}

const glitchStyle = document.createElement("style");
glitchStyle.textContent = `
    @keyframes glitchFloat {
        0% {transform: translate(0, 0);opacity: 0;}
        10% {opacity: 0.8;}
        25% {transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px);}
        50% {transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px);opacity: 0.6;}
        75% {transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px);}
        90% {opacity: 0.3;}
        100% {transform: translate(0, 0);opacity: 0;}
    }

    @keyframes glitchFade {
        0%, 100% { opacity: 0; }
        10%, 90% { opacity: 0.8; }
        50% { opacity: ${0.3 + Math.random() * 0.5}; }
    }
`;
document.head.appendChild(glitchStyle);

createGlitchDots();
