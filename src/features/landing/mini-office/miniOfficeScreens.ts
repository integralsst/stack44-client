import * as THREE from 'three';

export function dashboardTexture(title: string) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 288;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#0b2424'; c.fillRect(0, 0, 512, 288);
  c.fillStyle = '#d5bb77'; c.fillRect(22, 22, 7, 22);
  c.fillStyle = '#eef4e9'; c.font = 'bold 27px Arial'; c.fillText(title, 42, 42);
  c.fillStyle = '#7e9e96'; c.font = '14px Arial'; c.fillText('SG-SST  ·  DATOS DEMOSTRATIVOS', 24, 68);
  const labels = ['Plan anual', 'Inspecciones', 'Acciones', 'PHVA'];
  const values = [.86, .72, .63, .91];
  labels.forEach((label, i) => {
    const y = 103 + i * 43;
    c.fillStyle = '#dce8df'; c.font = '16px Arial'; c.fillText(label, 24, y);
    c.fillStyle = '#24423d'; c.fillRect(157, y - 13, 260, 13);
    c.fillStyle = i === 2 ? '#bd9a58' : '#6bac88'; c.fillRect(157, y - 13, 260 * values[i], 13);
    c.fillStyle = '#f4eee0'; c.fillText(String(Math.round(values[i] * 100)) + '%', 439, y);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 2;
  return texture;
}
