"use client";

import { useEffect, useRef, useState } from "react";

export function P5Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [p5Loaded, setP5Loaded] = useState(false);

  useEffect(() => {
    // Check if script is already injected
    if (document.getElementById("p5-script")) {
      setP5Loaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "p5-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js";
    script.async = true;
    script.onload = () => setP5Loaded(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove script to allow hot reloads to reuse it
    };
  }, []);

  useEffect(() => {
    if (!p5Loaded || !containerRef.current || !(window as any).p5) return;

    // The Algorithmic Philosophy: "Quantum Flow Systems"
    // Flow fields acting as fluid pipes, navigating rigid geometric space
    const sketch = (p: any) => {
      let particles: any[] = [];
      const numParticles = 250;
      let noiseScale = 0.005;

      p.setup = () => {
        // Find dimensions of parent container to remain contained in Hero section
        const parent = containerRef.current?.parentElement;
        const width = parent?.clientWidth || p.windowWidth;
        const height = parent?.clientHeight || p.windowHeight;
        
        let canvas = p.createCanvas(width, height);
        canvas.style("display", "block");
        
        for (let i = 0; i < numParticles; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            history: [] // for trailing lines
          });
        }
        p.background(9, 9, 11);
      };

      p.draw = () => {
        p.background(9, 9, 11, 20); // Faint trails background
        
        p.strokeWeight(1.5);
        p.noFill();
        
        for (let i = 0; i < numParticles; i++) {
          let part = particles[i];
          
          // Noise map driving the "flow"
          let angle = p.noise(part.x * noiseScale, part.y * noiseScale, p.frameCount * 0.002) * p.TWO_PI * 4;
          
          // Quantize angles to force geometric "pipe-like" right angle movement mostly
          let quantizedAngle = p.round(angle / (p.PI / 4)) * (p.PI / 4);
          
          // Slowly blend to quantized pipe rigidness
          let finalAngle = p.lerp(angle, quantizedAngle, 0.8);
          
          part.x += p.cos(finalAngle) * 2;
          part.y += p.sin(finalAngle) * 2;
          
          part.history.push({x: part.x, y: part.y});
          if (part.history.length > 20) {
            part.history.shift();
          }
          
          // Draw trail
          p.beginShape();
          for (let j = 0; j < part.history.length; j++) {
            let pos = part.history[j];
            // Fade out the tail
            let alpha = p.map(j, 0, part.history.length, 0, 150);
            p.stroke(0, 102, 255, alpha); // #0066FF cyan 
            p.vertex(pos.x, pos.y);
          }
          p.endShape();
          
          // Draw geometric joint where they occasionally pivot sharply
          if (p.frameCount % 45 === 0 && p.random() > 0.9) {
            p.fill(255, 255, 255, 200);
            p.noStroke();
            p.rect(part.x - 2, part.y - 2, 4, 4);
          }
          
          // Reset particles that go off screen
          if (part.x < 0 || part.x > p.width || part.y < 0 || part.y > p.height) {
            part.x = p.random(p.width);
            part.y = p.random(p.height);
            part.history = [];
          }
        }
      };

      p.windowResized = () => {
        const parent = containerRef.current?.parentElement;
        if (parent) {
          p.resizeCanvas(parent.clientWidth, parent.clientHeight);
        }
      };
    };

    let p5Instance = new (window as any).p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, [p5Loaded]);

  return <div ref={containerRef} className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none" />;
}
