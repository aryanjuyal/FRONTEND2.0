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
    let stars = [];
    let mouse = { x: 0, y: 0 };
    let hoverTarget = 0;
    let hoverLevel = 0;
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
      const isMobile = width < 768;
      const density = isMobile ? 18000 : 24000;
      const count = Math.max(80, Math.floor((width * height) / density));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        base: 0.55 + Math.random() * 0.25,
        amp: 0.25 + Math.random() * 0.35,
        speed: 0.8 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2
        , vx: (Math.random() - 0.5) * 0.08
        , vy: (Math.random() - 0.5) * 0.08
      }));
    };

    const spawn = (now) => {
      const isMobile = width < 768;
      const duration = 6000 + Math.random() * 3000;
      const travel = Math.max(width, height) * 1.2;
      const tail = (isMobile ? 0.10 : 0.12) * Math.min(width, height);
      const opacity = 0.28 + Math.random() * 0.14;
      const size = 2;
      const depth = 0.6 + Math.random() * 0.6;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.15;
      const fromTop = Math.random() < 0.5;
      const startX = fromTop ? Math.random() * width : -20;
      const startY = fromTop ? -20 : Math.random() * height * 0.8;
      const wobble = Math.random() < 0.35;
      const wobbleAmp = wobble ? (isMobile ? 10 : 16) + Math.random() * (isMobile ? 10 : 18) : 0;
      const wobbleFreq = wobble ? 1.2 + Math.random() * 2.0 : 0;
      const wobblePhase = Math.random() * Math.PI * 2;
      const useCurve = Math.random() < 0.7;
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      const endX = startX + travel * vx;
      const endY = startY + travel * vy;
      const perpX = -vy;
      const perpY = vx;
      const perpLen = Math.hypot(perpX, perpY) || 1;
      const curveAmp = useCurve ? (isMobile ? 60 : 90) + Math.random() * (isMobile ? 50 : 120) : 0;
      const controlX = (startX + endX) / 2 + (perpX / perpLen) * curveAmp;
      const controlY = (startY + endY) / 2 + (perpY / perpLen) * curveAmp;
      const minDist = isMobile ? 40 : 60;
      const colors = ['0,246,255','168,85,247','34,197,94','56,189,248'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const dx = (m.startX ?? 0) - startX;
        const dy = (m.startY ?? 0) - startY;
        if (dx * dx + dy * dy < minDist * minDist) return;
      }
      meteors.push({ start: now, duration, travel, tail, opacity, size, depth, angle, startX, startY, wobbleAmp, wobbleFreq, wobblePhase, curveAmp, controlX, controlY, endX, endY, vx, vy, color });
      if (meteors.length > 120) meteors = meteors.slice(meteors.length - 120);
    };

    const drawMeteors = (t) => {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, width, height);
      ctx.save();

      hoverLevel += (hoverTarget - hoverLevel) * 0.03;
      const px = ((mouse.x / Math.max(1, width)) - 0.5) * 4 * hoverLevel;
      const py = ((mouse.y / Math.max(1, height)) - 0.5) * 4 * hoverLevel;

      stars.forEach(s => {
        s.x += s.vx * (0.6 + 0.8 * hoverLevel);
        s.y += s.vy * (0.6 + 0.8 * hoverLevel);
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      });

      stars.forEach(s => {
        const o = Math.max(0, Math.min(1, s.base + Math.sin(t * 0.001 * s.speed + s.phase) * s.amp));
        ctx.globalAlpha = o;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const diagScale = 1 / Math.SQRT2;
      meteors = meteors.filter(m => {
        const elapsed = t - m.start;
        const p = Math.min(elapsed / m.duration, 1);
        const base = m.travel * p * (m.depth || 1);
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
          const nx = -dy / dlen;
          const ny = dx / dlen;
          x += nx * wobbleDelta;
          y += ny * wobbleDelta;
          const len = m.tail * diagScale;
          tx = x - (dx / dlen) * len;
          ty = y - (dy / dlen) * len;
        } else {
          const dirx = (m.vx ?? Math.cos(m.angle ?? Math.PI / 4));
          const diry = (m.vy ?? Math.sin(m.angle ?? Math.PI / 4));
          const dlen = Math.hypot(dirx, diry) || 1;
          const nx = -diry / dlen;
          const ny = dirx / dlen;
          x = m.startX + base * dirx + nx * wobbleDelta;
          y = m.startY + base * diry + ny * wobbleDelta;
          const len = m.tail * diagScale;
          tx = x - len;
          ty = y - len;
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = `rgba(${m.color},1)`;
        ctx.shadowBlur = 8;
        const grad = ctx.createLinearGradient(x, y, tx, ty);
        grad.addColorStop(0, `rgba(${m.color},${m.opacity})`);
        grad.addColorStop(1, `rgba(${m.color},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 * (m.depth || 1);
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
    const interval = isMobile ? 1600 : 1400;
    spawnId = window.setInterval(() => {
      const now = performance.now();
      spawn(now);
      if (Math.random() < 0.1) spawn(now);
    }, interval);
    const onMove = (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      hoverTarget = 1;
    };
    const onLeave = () => { hoverTarget = 0; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      cancelAnimationFrame(rafId);
      clearInterval(spawnId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30 mix-blend-screen" />;
};

export default MeteorShower;
