// sanitizes text and converts markdown/code/strong to safe HTML with copyable code blocks
function sanitizeAndHighlight(text) {
  if (!text) return "";
  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // First, convert fenced code blocks ```...``` to a copyable HTML block.
  // Work on the raw text to preserve code content then escape it.
  text = String(text);
  text = text.replace(/```([\s\S]*?)```/g, (m, code) => {
    const esc = escapeHtml(code);
    return `<div class="code-wrapper"><button class="copy-btn" onclick="copyCode(this)" aria-label="Copy code">Copy</button><pre><code>${esc}</code></pre></div>`;
  });

  // Escape remaining HTML and handle inline code `like this`
  // (escape everything first, then restore the fenced blocks which are already escaped)
  // split on code-wrapper markers to avoid double escaping blocks we already inserted
  const parts = text.split(/(<div class="code-wrapper">[\s\S]*?<\/div>)/g);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith('<div class="code-wrapper">')) {
      // escape, then convert **bold** and <strong> (escaped) and inline `code`
      parts[i] = escapeHtml(parts[i])
        .replace(/\*\*(.+?)\*\*/g, '<span class="highlight">$1</span>')
        .replace(
          /&lt;strong&gt;(.+?)&lt;\/strong&gt;/g,
          '<span class="highlight">$1</span>'
        )
        .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
        .replace(/\n/g, "<br/>");
    }
  }
  return parts.join("");
}

// copy helper exposed to inline onclick in sanitized HTML
window.copyCode = function (btn) {
  try {
    const wrapper = btn.closest(".code-wrapper");
    const codeEl = wrapper?.querySelector("pre code");
    if (!codeEl) return;
    const text = codeEl.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const prev = btn.innerText;
      btn.innerText = "Copied";
      setTimeout(() => (btn.innerText = prev), 1400);
    });
  } catch (e) {
    console.warn(e);
  }
};

window.sanitizeAndHighlight = sanitizeAndHighlight;
