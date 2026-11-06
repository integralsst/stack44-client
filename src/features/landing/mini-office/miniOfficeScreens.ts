import * as THREE from 'three';

function texture(canvas: HTMLCanvasElement) {
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  result.anisotropy = 2;
  return result;
}

export function backdropTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 768;
  const c = canvas.getContext('2d')!;
  const base = c.createLinearGradient(0, 0, 0, 768);
  base.addColorStop(0, '#17251f'); base.addColorStop(.55, '#101c1a'); base.addColorStop(1, '#0c1414');
  c.fillStyle = base; c.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 30; i++) {
    const x = (i * 337.3) % 1024;
    const y = (i * 183.7) % 440 - 40;
    const radius = 35 + (i % 5) * 28;
    const glow = c.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, i % 4 ? 'rgba(101,145,83,.17)' : 'rgba(236,176,87,.15)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = glow; c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return texture(canvas);
}

export function logoPanelTexture(url: string, crop: [number, number, number, number], signal: AbortSignal, onReady: (loaded: THREE.Texture) => void) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const c = canvas.getContext('2d')!;
  // The canvas stays transparent. The framed surface behind it supplies the matte.
  const result = texture(canvas);
  const image = new Image();
  image.onload = () => {
    if (signal.aborted) return;
    const [cx, cy, cw, ch] = crop;
    c.drawImage(image, image.width * cx, image.height * cy, image.width * cw, image.height * ch, 44, 44, 424, 424);
    // Swap in a fresh texture: some WebGL drivers do not upload a modified canvas consistently.
    onReady(texture(canvas));
  };
  image.onerror = () => { if (!signal.aborted) console.error('No se pudo cargar el logo de la oficina', url); };
  signal.addEventListener('abort', () => { image.onload = null; image.onerror = null; image.src = ''; }, { once: true });
  image.src = url;
  return result;
}

export function nameplateTexture(name: string) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#17221f'; c.fillRect(0, 0, 512, 128);
  c.fillStyle = '#cda969'; c.fillRect(13, 13, 486, 3);
  c.fillRect(13, 111, 486, 3);
  c.fillStyle = '#f7f3e8'; c.font = 'bold 69px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(name, 256, 66);
  return texture(canvas);
}

export function dashboardTexture(title: string) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 432;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#091d23'; c.fillRect(0, 0, 768, 432);
  c.fillStyle = '#0e2a2d'; c.fillRect(22, 77, 724, 333);
  c.fillStyle = '#69d586'; c.fillRect(25, 26, 7, 26);
  c.fillStyle = '#f2f7ef'; c.font = 'bold 31px Arial'; c.fillText(title, 45, 52);
  c.fillStyle = '#92a9a7'; c.font = '17px Arial'; c.fillText('DATOS DEMOSTRATIVOS · SG-SST', 28, 103);
  c.lineWidth = 22; c.strokeStyle = '#24454b'; c.beginPath(); c.arc(148, 250, 84, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#68da87'; c.beginPath(); c.arc(148, 250, 84, -Math.PI / 2, Math.PI * 1.32); c.stroke();
  c.fillStyle = '#ffffff'; c.font = 'bold 60px Arial'; c.fillText('87%', 90, 270);
  c.fillStyle = '#a9bdad'; c.font = '18px Arial'; c.fillText('Plan anual', 100, 311);
  const labels = ['Planear', 'Hacer', 'Verificar', 'Actuar'];
  const bars = [.95, .88, .9, .93];
  labels.forEach((label, i) => {
    const x = 276 + i * 117;
    c.fillStyle = '#274e4c'; c.fillRect(x, 171, 75, 140);
    c.fillStyle = i === 2 ? '#5bbfda' : '#72d885'; c.fillRect(x, 311 - 135 * bars[i], 75, 135 * bars[i]);
    c.fillStyle = '#f4f4ed'; c.font = 'bold 24px Arial'; c.fillText(String(Math.round(bars[i] * 100)) + '%', x + 10, 154);
    c.fillStyle = '#aec7c0'; c.font = '16px Arial'; c.fillText(label, x + 3, 338);
  });
  c.strokeStyle = '#d6aa56'; c.lineWidth = 3; c.beginPath();
  [[282, 381], [350, 370], [423, 376], [493, 349], [563, 355], [634, 332], [705, 314]].forEach(([x, y], i) => {
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  }); c.stroke();
  return texture(canvas);
}
