async function loadQA() {
  const res = await fetch('qa.json');
  const items = await res.json();
  const container = document.getElementById('qaModalBody');
  container.innerHTML = items.map(item => `
    <div class="qa-item">
      <div class="qa-question">
        <span class="qa-icon">Q</span>
        <h3>${item.question}</h3>
      </div>
      <div class="qa-answer">
        <span class="qa-icon answer">A</span>
        <p>${item.answer}</p>
      </div>
    </div>
  `).join('');
}

loadQA();
