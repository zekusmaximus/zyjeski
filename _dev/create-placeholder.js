import { createCanvas } from 'canvas';
import fs from 'fs';

// Create a simple 400x300 placeholder image
const canvas = createCanvas(400, 300);
const ctx = canvas.getContext('2d');

// Create a gradient background
const gradient = ctx.createLinearGradient(0, 0, 400, 300);
gradient.addColorStop(0, '#6e0dd0');
gradient.addColorStop(1, '#0a0a14');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 400, 300);

// Add text
ctx.fillStyle = '#ffffff';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('Image Placeholder', 200, 150);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('placeholder.png', buffer);
