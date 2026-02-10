"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Nigerian trivia — culture, history, geography, politics, sports, entertainment, science, food
const QUESTIONS = [
  // History & Politics
  "What year did Nigeria gain independence?",
  "Who was Nigeria's first president?",
  "What does the green in Nigeria's flag represent?",
  "Which city was Nigeria's capital before Abuja?",
  "Who wrote the Nigerian national anthem?",
  "What year did Nigeria become a republic?",
  "Who was the first military head of state?",
  "What is the name of Nigeria's constitution?",

  // Geography
  "How many states does Nigeria have?",
  "What is the largest state in Nigeria by area?",
  "Which river is the longest in Nigeria?",
  "What ocean borders Nigeria to the south?",
  "Which Nigerian city is called the 'Centre of Excellence'?",
  "What is the highest point in Nigeria?",
  "Which state is known as the 'Sunshine State'?",
  "Where is the Yankari Game Reserve?",

  // Culture & Language
  "How many major ethnic groups are in Nigeria?",
  "What language is 'Bawo ni' from?",
  "What is Jollof rice best known for?",
  "What is the Igbo New Yam Festival called?",
  "What does 'Oga' mean in Nigerian pidgin?",
  "Which festival is celebrated in Osun State?",
  "What is pounded yam typically eaten with?",
  "What is Suya made from?",

  // Sports & Entertainment
  "What is Nigeria's national football team called?",
  "Who is Wizkid's real name?",
  "Which Nigerian won the Nobel Prize in Literature?",
  "What sport did Hakeem Olajuwon play?",
  "Who wrote 'Things Fall Apart'?",
  "What is Nollywood?",
  "Which Nigerian athlete won Olympic gold in 1996?",
  "What year did the Super Eagles win AFCON?",

  // Science & Education
  "What is the chemical symbol for Tin?",
  "Which Nigerian university was founded first?",
  "What is Nigeria's currency called?",
  "What does JAMB stand for?",
  "What is the NYSC program?",
  "How many geopolitical zones are in Nigeria?",

  // Fun & Random
  "What is 'Owambe' in Nigerian culture?",
  "What does 'Wahala' mean?",
  "Which state produces the most crude oil?",
  "What is Agege bread famous for?",
  "What is the meaning of 'No wahala'?",
  "Which market is the largest in West Africa?",
];

const MAX_BALLS = 16;
const MIN_SPLIT_SIZE = 20;
const SPLIT_RATIO = 0.65;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
  rotation: number;
  rotationSpeed: number;
  age: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  opacity: number;
  life: number;
  maxLife: number;
  fontSize: number;
}

interface QuestionPopup {
  id: number;
  text: string;
  x: number;
  y: number;
  createdAt: number;
}

const AnimatedAuthBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const [questions, setQuestions] = useState<QuestionPopup[]>([]);
  const questionIdRef = useRef(0);
  const lastPopTimeRef = useRef(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const spawnQuestion = useCallback((x: number, y: number, time: number) => {
    if (time - lastPopTimeRef.current > 2000) {
      lastPopTimeRef.current = time;
      const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      questionIdRef.current += 1;
      const dims = dimensionsRef.current;
      setQuestions((prev) => [
        ...prev.slice(-4),
        {
          id: questionIdRef.current,
          text: q,
          x: Math.max(20, Math.min(x, dims.w - 280)),
          y: y,
          createdAt: Date.now(),
        },
      ]);
    }
  }, []);

  // Initialize
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    dimensionsRef.current = { w, h };

    // Create balls with varied properties
    const balls: Ball[] = [];
    const ballCount = Math.min(8, Math.max(4, Math.floor(w / 200)));
    for (let i = 0; i < ballCount; i++) {
      const speed = 0.5 + Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;
      balls.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 30 + Math.random() * 45,
        opacity: 0.1 + Math.random() * 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        age: 0,
      });
    }
    ballsRef.current = balls;

    // Create floating text snippets
    const texts: FloatingText[] = [];
    const snippets = ["9ja", "Naija", "Exam", "Arena", "Win", "Compete", "Learn"];
    for (let i = 0; i < 5; i++) {
      texts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        text: snippets[Math.floor(Math.random() * snippets.length)],
        opacity: 0.04 + Math.random() * 0.06,
        life: 0,
        maxLife: Infinity,
        fontSize: 40 + Math.random() * 60,
      });
    }
    floatingTextsRef.current = texts;

    // Load logo
    const img = new Image();
    img.src = "/invertedLogo.png";
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dimensionsRef.current = { w: canvas.width, h: canvas.height };
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = (time: number) => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      // Draw floating text (background layer)
      for (const ft of floatingTextsRef.current) {
        ft.x += ft.vx;
        ft.y += ft.vy;
        if (ft.x < -100) ft.x = W + 100;
        if (ft.x > W + 100) ft.x = -100;
        if (ft.y < -100) ft.y = H + 100;
        if (ft.y > H + 100) ft.y = -100;

        ctx.save();
        ctx.globalAlpha = ft.opacity;
        ctx.font = `bold ${ft.fontSize}px Arial`;
        ctx.fillStyle = "#8B1E1E";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.opacity *= 0.98;
        if (p.life > p.maxLife || p.opacity < 0.01) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 30, 30, ${p.opacity})`;
        ctx.fill();
      }

      // Update & collide balls
      const balls = ballsRef.current;
      const logo = logoRef.current;
      const newBalls: Ball[] = [];

      // Update positions first
      for (const ball of balls) {
        ball.pulsePhase += ball.pulseSpeed;
        ball.rotation += ball.rotationSpeed;
        ball.age += 1;
        ball.x += ball.vx;
        ball.y += ball.vy;

        const pulse = 1 + Math.sin(ball.pulsePhase) * 0.08;
        const currentSize = ball.size * pulse;

        // Bounce off walls
        let bounced = false;
        if (ball.x <= currentSize || ball.x >= W - currentSize) {
          ball.vx *= -1;
          ball.x = Math.max(currentSize, Math.min(W - currentSize, ball.x));
          bounced = true;
        }
        if (ball.y <= currentSize || ball.y >= H - currentSize) {
          ball.vy *= -1;
          ball.y = Math.max(currentSize, Math.min(H - currentSize, ball.y));
          bounced = true;
        }

        if (bounced) {
          for (let p = 0; p < 5; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            particles.push({
              x: ball.x, y: ball.y,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
              size: 2 + Math.random() * 3,
              opacity: 0.3 + Math.random() * 0.3,
              life: 0, maxLife: 60 + Math.random() * 40,
            });
          }
          spawnQuestion(ball.x, ball.y - currentSize - 10, time);
        }
      }

      // Ball-to-ball collision detection & splitting
      const collided = new Set<number>();
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          if (collided.has(i) || collided.has(j)) continue;
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.size + b.size;

          if (dist < minDist && dist > 0) {
            // Separate overlapping balls
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;

            // Spawn collision particles
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            for (let p = 0; p < 8; p++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 1 + Math.random() * 2;
              particles.push({
                x: midX, y: midY,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                opacity: 0.4 + Math.random() * 0.3,
                life: 0, maxLife: 50 + Math.random() * 30,
              });
            }
            spawnQuestion(midX, midY - Math.max(a.size, b.size) - 10, time);

            // Check if both balls can split
            const canSplitA = a.size >= MIN_SPLIT_SIZE && balls.length + newBalls.length < MAX_BALLS;
            const canSplitB = b.size >= MIN_SPLIT_SIZE && balls.length + newBalls.length < MAX_BALLS;

            if (canSplitA || canSplitB) {
              // Split: mark originals for removal, create smaller offspring
              const createChild = (parent: Ball, offsetAngle: number): Ball => {
                const childSize = parent.size * SPLIT_RATIO;
                const speed = Math.sqrt(parent.vx * parent.vx + parent.vy * parent.vy) * 1.1;
                return {
                  x: parent.x + Math.cos(offsetAngle) * childSize,
                  y: parent.y + Math.sin(offsetAngle) * childSize,
                  vx: Math.cos(offsetAngle) * speed,
                  vy: Math.sin(offsetAngle) * speed,
                  size: childSize,
                  opacity: Math.min(parent.opacity + 0.05, 0.35),
                  pulsePhase: Math.random() * Math.PI * 2,
                  pulseSpeed: 0.01 + Math.random() * 0.02,
                  rotation: Math.random() * Math.PI * 2,
                  rotationSpeed: (Math.random() - 0.5) * 0.015,
                  age: 0,
                };
              };

              if (canSplitA) {
                collided.add(i);
                const perpA = Math.atan2(-nx, ny);
                newBalls.push(createChild(a, perpA + 0.5));
                newBalls.push(createChild(a, perpA - 0.5));
              }
              if (canSplitB) {
                collided.add(j);
                const perpB = Math.atan2(nx, -ny);
                newBalls.push(createChild(b, perpB + 0.5));
                newBalls.push(createChild(b, perpB - 0.5));
              }
            } else {
              // Elastic bounce for small balls
              const dvx = a.vx - b.vx;
              const dvy = a.vy - b.vy;
              const dot = dvx * nx + dvy * ny;
              a.vx -= dot * nx;
              a.vy -= dot * ny;
              b.vx += dot * nx;
              b.vy += dot * ny;
            }
          }
        }
      }

      // Remove collided balls, add new children
      if (collided.size > 0 || newBalls.length > 0) {
        ballsRef.current = [
          ...balls.filter((_, idx) => !collided.has(idx)),
          ...newBalls,
        ];
      }

      // Fade out & remove very small or old split balls, respawn original-size ones
      const currentBalls = ballsRef.current;
      for (let i = currentBalls.length - 1; i >= 0; i--) {
        const b = currentBalls[i];
        if (b.size < 14) {
          b.opacity *= 0.97;
          if (b.opacity < 0.02) {
            currentBalls.splice(i, 1);
          }
        }
      }

      // Respawn if too few balls remain
      if (currentBalls.length < 4) {
        const speed = 0.5 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        currentBalls.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 30 + Math.random() * 45,
          opacity: 0.1 + Math.random() * 0.25,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          age: 0,
        });
      }

      // Draw all balls
      for (const ball of ballsRef.current) {
        const pulse = 1 + Math.sin(ball.pulsePhase) * 0.08;
        const currentSize = ball.size * pulse;

        // Outer ring
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, currentSize + 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 30, 30, ${ball.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Main circle
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 30, 30, ${ball.opacity})`;
        ctx.fill();

        // Logo inside
        if (logo) {
          ctx.save();
          ctx.globalAlpha = ball.opacity + 0.3;
          ctx.translate(ball.x, ball.y);
          ctx.rotate(ball.rotation);
          ctx.beginPath();
          ctx.arc(0, 0, currentSize - 4, 0, Math.PI * 2);
          ctx.clip();
          const logoSize = currentSize * 1.4;
          ctx.drawImage(logo, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [spawnQuestion]);

  // Clean up old questions
  useEffect(() => {
    if (questions.length === 0) return;
    const timer = setTimeout(() => {
      setQuestions((prev) => prev.filter((q) => Date.now() - q.createdAt < 3500));
    }, 3500);
    return () => clearTimeout(timer);
  }, [questions]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,30,30,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,30,30,0.08),transparent_50%)]" />

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Floating question popups */}
      {questions.map((q) => (
        <div
          key={q.id}
          className="absolute pointer-events-none animate-float-up"
          style={{
            left: `${q.x}px`,
            top: `${q.y}px`,
          }}
        >
          <div className="bg-[#8B1E1E]/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-[#8B1E1E]/20">
            {q.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedAuthBackground;
