const input = document.getElementById('text-input');
const ecSelect = document.getElementById('ec-level');
const styleSelect = document.getElementById('qr-style');
const output = document.getElementById('qr-output');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

let debounceTimer;

function render() {
    const text = input.value.trim();
    output.innerHTML = '';

    if (!text) {
        output.innerHTML = '<div class="empty-state">Your QR code will appear here</div>';
        return;
    }

    const qr = qrcode(0, ecSelect.value);
    qr.addData(text);
    qr.make();

    const count = qr.getModuleCount();
    const cellSize = Math.max(4, Math.floor(280 / count));
    const margin = 4;
    const renderScale = 3;

    const canvas = document.createElement('canvas');
    const size = count * cellSize + margin * 2 * cellSize;
    canvas.width = size * renderScale;
    canvas.height = size * renderScale;

    const ctx = canvas.getContext('2d');
    const style = styleSelect.value;
    const themeStyles = getComputedStyle(document.documentElement);
    const qrBackground = themeStyles.getPropertyValue('--qr-bg').trim();
    const qrForeground = themeStyles.getPropertyValue('--qr-fg').trim();

    ctx.scale(renderScale, renderScale);

    ctx.fillStyle = qrBackground;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = qrForeground;

    const pad = cellSize * 0.1;
    const r2 = cellSize * 0.35;

    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            if (!qr.isDark(r, c)) continue;
            const x = (c + margin) * cellSize;
            const y = (r + margin) * cellSize;

            if (style === 'dot') {
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - pad, 0, Math.PI * 2);
                ctx.fill();
            } else if (style === 'rounded') {
                const s = cellSize - pad * 2;
                ctx.beginPath();
                ctx.roundRect(x + pad, y + pad, s, s, r2);
                ctx.fill();
            } else if (style === 'diamond') {
                const cx = x + cellSize / 2;
                const cy = y + cellSize / 2;
                const h = cellSize / 2 - pad;
                ctx.beginPath();
                ctx.moveTo(cx, cy - h);
                ctx.lineTo(cx + h, cy);
                ctx.lineTo(cx, cy + h);
                ctx.lineTo(cx - h, cy);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }

    canvas.style.borderRadius = '12px';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = '100%';
    canvas.style.maxWidth = size + 'px';
    output.appendChild(canvas);
}

function onInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 250);
}

input.addEventListener('input', onInput);
ecSelect.addEventListener('change', render);
styleSelect.addEventListener('change', render);
prefersDarkScheme.addEventListener('change', render);
