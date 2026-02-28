import { useEffect, useRef } from 'react';

export function ElevationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const lines: { y: number; speed: number; amplitude: number; frequency: number; offset: number }[] = [];
    const lineCount = 15;

    for (let i = 0; i < lineCount; i++) {
      lines.push({
        y: height * 0.2 + (height * 0.6 * (i / lineCount)),
        speed: 0.0005 + Math.random() * 0.001,
        amplitude: 30 + Math.random() * 50,
        frequency: 0.002 + Math.random() * 0.003,
        offset: Math.random() * 1000
      });
    }

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      
      lines.forEach((line, i) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + (i / lineCount) * 0.1})`;
        
        for (let x = 0; x <= width; x += 5) {
          const y = line.y + Math.sin((x * line.frequency) + time * line.speed + line.offset) * line.amplitude +
                             Math.cos((x * line.frequency * 0.5) + time * line.speed * 1.5) * (line.amplitude * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    render(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />;
}
