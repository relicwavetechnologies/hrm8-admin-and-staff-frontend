import type { Certificate, CertificateTemplate } from '@/shared/types/performance';

/**
 * Generates a social media-friendly image of a certificate with employee photo
 * Returns a data URL of the generated image
 */
export async function generateCertificateImage(
  certificate: Certificate,
  template: CertificateTemplate,
  employeePhotoUrl?: string
): Promise<string> {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size for social media (1200x630 is optimal for most platforms)
  canvas.width = 1200;
  canvas.height = 630;

  // Modern gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.colors.primary);
  gradient.addColorStop(0.5, template.colors.secondary);
  gradient.addColorStop(1, template.colors.primary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle geometric pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < canvas.width; i += 80) {
    for (let j = 0; j < canvas.height; j += 80) {
      ctx.beginPath();
      ctx.arc(i, j, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Elegant border with gradient
  const borderGradient = ctx.createLinearGradient(30, 30, canvas.width - 30, canvas.height - 30);
  borderGradient.addColorStop(0, template.colors.accent);
  borderGradient.addColorStop(0.5, '#ffffff');
  borderGradient.addColorStop(1, template.colors.accent);
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Inner decorative border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);
  ctx.setLineDash([]);

  // Achievement badge icon
  drawAchievementBadge(ctx, 120, 90, 50, template.colors.accent, certificate.type);

  // Title with shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE', canvas.width / 2, 100);
  ctx.shadowColor = 'transparent';

  // Certificate type with elegant styling
  ctx.font = 'italic 26px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('of ' + certificate.description.replace('Certificate of ', ''), canvas.width / 2, 140);

  // Elegant decorative line with ornaments
  ctx.strokeStyle = template.colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 165);
  ctx.lineTo(950, 165);
  ctx.stroke();
  
  // Decorative circles on line
  ctx.fillStyle = template.colors.accent;
  ctx.beginPath();
  ctx.arc(250, 165, 5, 0, Math.PI * 2);
  ctx.arc(600, 165, 5, 0, Math.PI * 2);
  ctx.arc(950, 165, 5, 0, Math.PI * 2);
  ctx.fill();

  // Employee photo (if provided)
  let photoYOffset = 0;
  if (employeePhotoUrl) {
    try {
      const photoImg = await loadImage(employeePhotoUrl);
      const photoSize = 120;
      const photoX = canvas.width / 2 - photoSize / 2;
      const photoY = 190;
      
      // Draw circular photo with border
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(photoImg, photoX, photoY, photoSize, photoSize);
      ctx.restore();
      
      // Photo border with glow effect
      ctx.strokeStyle = template.colors.accent;
      ctx.lineWidth = 4;
      ctx.shadowColor = template.colors.accent;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      
      photoYOffset = 140;
    } catch (error) {
      console.warn('Could not load employee photo:', error);
    }
  }

  // Employee name with elegant styling
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 62px serif';
  ctx.fillText(certificate.employeeName, canvas.width / 2, 230 + photoYOffset);
  ctx.shadowColor = 'transparent';

  // Achievement description with wrapping
  ctx.font = '32px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  
  const achievementText = certificate.title;
  const maxWidth = 900;
  const words = achievementText.split(' ');
  let line = '';
  let y = 290 + photoYOffset;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, canvas.width / 2, y);
      line = words[n] + ' ';
      y += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  // Course details with enhanced styling
  if (certificate.certificateData.courseName) {
    y += 55;
    
    // Course name box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    const boxWidth = 600;
    const boxHeight = 50;
    ctx.fillRect(canvas.width / 2 - boxWidth / 2, y - 35, boxWidth, boxHeight);
    
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(certificate.certificateData.courseName, canvas.width / 2, y - 5);
    
    if (certificate.certificateData.score) {
      y += 45;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = template.colors.accent;
      ctx.fillText(`Score: ${certificate.certificateData.score}%`, canvas.width / 2, y);
      
      // Score stars
      if (certificate.certificateData.score >= 90) {
        drawStars(ctx, canvas.width / 2, y + 20, 5, template.colors.accent);
      } else if (certificate.certificateData.score >= 80) {
        drawStars(ctx, canvas.width / 2, y + 20, 4, template.colors.accent);
      }
    }
  }

  // Date section with elegant styling
  ctx.font = '20px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  const dateStr = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.fillText(`Issued on ${dateStr}`, canvas.width / 2, canvas.height - 120);

  // Issuer signature
  ctx.font = 'italic 18px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(certificate.issuerSignature, canvas.width / 2, canvas.height - 95);
  ctx.fillText(certificate.issuer, canvas.width / 2, canvas.height - 75);

  // Verification code with enhanced visibility
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = template.colors.accent;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;
  ctx.fillText(`VERIFY: ${certificate.verificationCode}`, canvas.width / 2, canvas.height - 40);
  ctx.shadowColor = 'transparent';

  // Enhanced corner ornaments
  drawCornerOrnament(ctx, 75, 75, 45, template.colors.accent);
  drawCornerOrnament(ctx, canvas.width - 75, 75, 45, template.colors.accent);
  drawCornerOrnament(ctx, 75, canvas.height - 75, 45, template.colors.accent);
  drawCornerOrnament(ctx, canvas.width - 75, canvas.height - 75, 45, template.colors.accent);

  // Convert canvas to data URL
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Load an image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Draw achievement badge based on certificate type
 */
function drawAchievementBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  type: string
) {
  ctx.save();
  
  // Badge circle background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Badge border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw icon based on type
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  if (type === 'certification') {
    // Shield icon
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x - size * 0.4, y - size * 0.2);
    ctx.lineTo(x - size * 0.4, y + size * 0.2);
    ctx.lineTo(x, y + size * 0.5);
    ctx.lineTo(x + size * 0.4, y + size * 0.2);
    ctx.lineTo(x + size * 0.4, y - size * 0.2);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'skill-mastery') {
    // Star icon
    drawStar(ctx, x, y, 5, size * 0.4, size * 0.2);
    ctx.stroke();
  } else if (type === 'course') {
    // Graduation cap
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y);
    ctx.lineTo(x, y - size * 0.3);
    ctx.lineTo(x + size * 0.4, y);
    ctx.lineTo(x, y + size * 0.3);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Trophy icon for program completion
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.2);
    ctx.lineTo(x - size * 0.3, y + size * 0.1);
    ctx.quadraticCurveTo(x, y + size * 0.4, x + size * 0.3, y + size * 0.1);
    ctx.lineTo(x + size * 0.3, y - size * 0.2);
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw stars for score rating
 */
function drawStars(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  count: number,
  color: string
) {
  const starSize = 15;
  const spacing = 25;
  const startX = centerX - ((count - 1) * spacing) / 2;
  
  ctx.fillStyle = color;
  
  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing;
    drawStar(ctx, x, centerY, 5, starSize, starSize * 0.4);
    ctx.fill();
  }
}

/**
 * Draw a star shape
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

  // Draw decorative star/flower pattern
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? size : size / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Download certificate image to user's device
 */
export function downloadCertificateImage(imageUrl: string, certificate: Certificate): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `certificate-${certificate.verificationCode}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
