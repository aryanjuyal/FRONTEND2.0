import React, { useRef, useEffect } from 'react';

const MeteorShower = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let rafId = 0;
    let spawnId = 0;
    let meteors = [];
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
    };

    const spawn = (now) => {
      const isMobile = width < 768;
      const duration = 6000 + Math.random() * 3000;
      const travel = Math.max(width, height) * 1.2;
      const tail = (isMobile ? 0.18 : 0.24) * Math.min(width, height);
      const opacity = 0.28 + Math.random() * 0.14;
      const size = 2;
      const angleOffset = (Math.random() - 0.5) * 0.04;
      const fromTop = Math.random() < 0.5;
      const startX = fromTop ? Math.random() * width : -20;
      const startY = fromTop ? -20 : Math.random() * height * 0.8;
      const wobble = Math.random() < 0.35;
      const wobbleAmp = wobble ? (isMobile ? 10 : 16) + Math.random() * (isMobile ? 10 : 18) : 0;
      const wobbleFreq = wobble ? 1.2 + Math.random() * 2.0 : 0;
      const wobblePhase = Math.random() * Math.PI * 2;
      const useCurve = Math.random() < 0.4;
      const vx = 1 + angleOffset;
      const vy = 1 - angleOffset;
      const endX = startX + travel * vx;
      const endY = startY + travel * vy;
      const perpX = -vy;
      const perpY = vx;
      const perpLen = Math.hypot(perpX, perpY) || 1;
      const curveAmp = useCurve ? (isMobile ? 30 : 50) + Math.random() * (isMobile ? 30 : 80) : 0;
      const controlX = (startX + endX) / 2 + (perpX / perpLen) * curveAmp;
      const controlY = (startY + endY) / 2 + (perpY / perpLen) * curveAmp;
      const minDist = isMobile ? 40 : 60;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const dx = (m.startX ?? 0) - startX;
        const dy = (m.startY ?? 0) - startY;
        if (dx * dx + dy * dy < minDist * minDist) return;
      }
      meteors.push({ start: now, duration, travel, tail, opacity, size, angleOffset, startX, startY, wobbleAmp, wobbleFreq, wobblePhase, curveAmp, controlX, controlY, endX, endY });
      if (meteors.length > 120) meteors = meteors.slice(meteors.length - 120);
    };

    const drawMeteors = (t) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      const diagScale = 1 / Math.SQRT2;
      meteors = meteors.filter(m => {
        const elapsed = t - m.start;
        const p = Math.min(elapsed / m.duration, 1);
        const base = m.travel * p;
        const offset = m.angleOffset * base;
        const wobbleDelta = m.wobbleAmp
          ? Math.sin(p * Math.PI * m.wobbleFreq + m.wobblePhase) * m.wobbleAmp
          : 0;
        let x, y, tx, ty;
        if (m.curveAmp && m.controlX !== undefined && m.endX !== undefined) {
          const P0x = m.startX, P0y = m.startY;
          const Cx = m.controlX, Cy = m.controlY;
          const P1x = m.endX, P1y = m.endY;
          const q = 1 - p;
          x = q * q * P0x + 2 * q * p * Cx + p * p * P1x + wobbleDelta;
          y = q * q * P0y + 2 * q * p * Cy + p * p * P1y - wobbleDelta;
          const dx = 2 * q * (Cx - P0x) + 2 * p * (P1x - Cx);
          const dy = 2 * q * (Cy - P0y) + 2 * p * (P1y - Cy);
          const dlen = Math.hypot(dx, dy) || 1;
          const len = m.tail * diagScale;
          tx = x - (dx / dlen) * len;
          ty = y - (dy / dlen) * len;
        } else {
          x = m.startX + base + offset + wobbleDelta;
          y = m.startY - offset + base - wobbleDelta;
          const len = m.tail * diagScale;
          tx = x - len;
          ty = y - len;
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = '#00f6ff';
        ctx.shadowBlur = 8;
        const grad = ctx.createLinearGradient(x, y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${m.opacity})`);
        grad.addColorStop(1, `rgba(0,246,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = Math.min(1, m.opacity + 0.15);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, m.size + 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return p < 1;
      });

      ctx.restore();
    };

    const loop = (time) => {
      drawMeteors(time);
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);
    resize();
    const isMobile = window.innerWidth < 768;
    const interval = isMobile ? 1400 : 1200;
    spawnId = window.setInterval(() => spawn(performance.now()), interval);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
      clearInterval(spawnId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default MeteorShower;
