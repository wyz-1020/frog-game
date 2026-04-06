/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GameState, Point, Obstacle } from './types';

// Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 500;
const GRAVITY = 0.35; 
const WIND_FACTOR = 0.05;

export default function App() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('aiming');
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [frogPos, setFrogPos] = useState<Point>({ x: 1000, y: 250 });
  const [frogVel, setFrogVel] = useState<Point>({ x: 0, y: 0 });
  const [basketPos, setBasketPos] = useState<Point>({ x: 150, y: 350 });
  const [baseBasketPos, setBaseBasketPos] = useState<Point>({ x: 150, y: 350 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [wind, setWind] = useState(0);
  const [message, setMessage] = useState('关卡 1：基础（跳进篮子！）');
  const [successAnimProgress, setSuccessAnimProgress] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  // Refs for physics to avoid re-render loops
  const gameStateRef = useRef<GameState>(gameState);
  const frogPosRef = useRef<Point>(frogPos);
  const frogVelRef = useRef<Point>(frogVel);
  const basketPosRef = useRef<Point>(basketPos);
  const obstaclesRef = useRef<Obstacle[]>(obstacles);
  const windRef = useRef<number>(wind);
  const levelRef = useRef<number>(level);
  const baseBasketPosRef = useRef<Point>(baseBasketPos);

  // Sync refs with state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { frogPosRef.current = frogPos; }, [frogPos]);
  useEffect(() => { frogVelRef.current = frogVel; }, [frogVel]);
  useEffect(() => { basketPosRef.current = basketPos; }, [basketPos]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { windRef.current = wind; }, [wind]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { baseBasketPosRef.current = baseBasketPos; }, [baseBasketPos]);

  // Initialize Level
  const initLevel = useCallback((lvl: number, isNewLevel: boolean = false) => {
    let windVal = 0;
    if (lvl >= 7 && lvl < 9) {
      windVal = (Math.random() * 0.4 - 0.2);
    } else if (lvl >= 9) {
      windVal = (Math.random() * 0.8 - 0.4); 
    }
    
    setWind(windVal);
    setFrogPos({ x: 1000, y: 250 });
    setFrogVel({ x: 0, y: 0 });
    setGameState('aiming');
    setSuccessAnimProgress(0);
    
    let currentBasketPos = basketPosRef.current;
    if (isNewLevel) {
      let newPos = { x: 200, y: 350 };
      if (lvl === 1) {
        newPos = { x: 200, y: 350 };
      } else if (lvl === 2) {
        newPos = { x: 150, y: 250 };
      } else if (lvl === 3) {
        newPos = { x: 100, y: 150 };
      } else if (lvl === 4) {
        newPos = { x: 150, y: 300 }; 
      } else if (lvl === 5) {
        newPos = { x: 100, y: 80 }; 
      } else if (lvl === 6) {
        newPos = { x: 250, y: 250 }; 
      } else if (lvl === 7) {
        newPos = { x: 150, y: 250 };
      } else if (lvl === 8) {
        newPos = { x: 150, y: 250 };
      } else if (lvl === 9) {
        newPos = { x: 100, y: 250 };
      } else if (lvl === 10) {
        newPos = { x: 80, y: 250 };
      } else {
        const randomY = 100 + Math.random() * 300;
        const randomX = 50 + Math.random() * 350;
        newPos = { x: randomX, y: randomY };
      }
      setBasketPos(newPos);
      setBaseBasketPos(newPos);
      currentBasketPos = newPos;
    }

    // Progressive Obstacles
    let newObstacles: Obstacle[] = [];
    if (lvl === 4) {
      const obstacleX = currentBasketPos.x + (1000 - currentBasketPos.x) * 0.5;
      newObstacles = [
        { x: obstacleX, y: 0, width: 20, height: 100, type: 'pencil' },
        { x: obstacleX, y: 100, width: 20, height: 100, type: 'pencil' },
        { x: obstacleX, y: 200, width: 20, height: 50, type: 'pencil' },
        { x: obstacleX, y: 330, width: 20, height: 100, type: 'pencil' },
        { x: obstacleX, y: 430, width: 20, height: 70, type: 'pencil' }
      ];
    } else if (lvl === 5) {
      const obstacleX = 450;
      newObstacles = [
        { x: obstacleX, y: 120, width: 25, height: 380, type: 'pencil' }
      ];
    } else if (lvl === 6) {
      const obstacleX1 = 400;
      const obstacleX2 = 700;
      newObstacles = [
        { x: obstacleX1, y: 300, width: 20, height: 200, type: 'pencil' },
        { x: obstacleX2, y: 0, width: 20, height: 200, type: 'pencil' }
      ];
    } else if (lvl === 7) {
      newObstacles = [
        { x: 500, y: 100, width: 20, height: 400, type: 'pencil' }
      ];
    } else if (lvl === 8) {
      newObstacles = [
        { x: 600, y: 350, width: 100, height: 60, type: 'stone' }
      ];
    } else if (lvl === 9) {
      newObstacles = [
        { x: 400, y: 0, width: 20, height: 250, type: 'pencil' },
        { x: 700, y: 250, width: 20, height: 250, type: 'pencil' }
      ];
    } else if (lvl === 10) {
      newObstacles = [
        { x: 350, y: 200, width: 20, height: 300, type: 'pencil' },
        { x: 550, y: 0, width: 20, height: 300, type: 'pencil' },
        { x: 750, y: 300, width: 80, height: 60, type: 'stone' }
      ];
    }
    setObstacles(newObstacles);

    const hints = [
      "关卡 1：基础（跳进篮子！）",
      "关卡 2：更远一点！",
      "关卡 3：瞄准中心！",
      "关卡 4：小心铅笔！",
      "关卡 5：越过障碍！",
      "关卡 6：精准控制！",
      "关卡 7：起风了！",
      "关卡 8：移动的目标！",
      "关卡 9：风力加强！",
      "关卡 10：终极挑战！"
    ];
    setMessage(hints[lvl - 1] || "继续努力！");
  }, []);

  useEffect(() => {
    initLevel(level, true);
  }, [level, initLevel]);

  // Physics Loop
  const update = useCallback(() => {
    const currentGameState = gameStateRef.current;
    const currentFrogPos = frogPosRef.current;
    const currentFrogVel = frogVelRef.current;
    const currentBasketPos = basketPosRef.current;
    const currentObstacles = obstaclesRef.current;
    const currentWind = windRef.current;
    const currentLevel = levelRef.current;
    const currentBaseBasketPos = baseBasketPosRef.current;

    if (currentGameState === 'jumping') {
      const nextX = currentFrogPos.x + currentFrogVel.x + currentWind;
      const nextY = currentFrogPos.y + currentFrogVel.y;
      
      const newVelY = currentFrogVel.y + GRAVITY;
      setFrogVel({ x: currentFrogVel.x, y: newVelY });

      const dx = Math.abs(nextX - currentBasketPos.x);
      const dy = Math.abs(nextY - currentBasketPos.y);
      
      if (dx < 110 && dy < 110) {
        setGameState('entering_box');
        const points = currentLevel <= 3 ? 100 : currentLevel <= 6 ? 200 : 300;
        setScore(s => s + points);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        let hitObstacle = false;
        for (const obs of currentObstacles) {
          if (nextX > obs.x && nextX < obs.x + obs.width && nextY > obs.y && nextY < obs.y + obs.height) {
            setGameState('fail');
            hitObstacle = true;
            break;
          }
        }

        if (!hitObstacle) {
          if (nextY > 460 || nextX < 0 || nextX > 1200) {
            setGameState('fail');
          } else {
            setFrogPos({ x: nextX, y: nextY });
          }
        }
      }
    }

    if (currentGameState === 'entering_box') {
      setSuccessAnimProgress(prev => {
        const next = prev + 0.15; 
        if (next >= 1) {
          setGameState('success');
          return 1;
        }
        setFrogPos(p => ({
          x: p.x + (currentBasketPos.x - p.x) * 0.4,
          y: p.y + (currentBasketPos.y - p.y) * 0.4
        }));
        return next;
      });
    }

    if (currentLevel >= 7 && currentGameState !== 'success' && currentGameState !== 'entering_box') {
      const time = Date.now() / 1000;
      
      if (currentLevel === 7) {
        setBasketPos({
          x: currentBaseBasketPos.x,
          y: currentBaseBasketPos.y + Math.sin(time * 2.5) * 100
        });
      } else if (currentLevel === 8) {
        setBasketPos({
          x: currentBaseBasketPos.x + Math.cos(time * 2) * 100,
          y: currentBaseBasketPos.y + Math.sin(time * 2.5) * 80
        });
      } else if (currentLevel === 9) {
        setBasketPos({
          x: currentBaseBasketPos.x + Math.cos(time * 3) * 150,
          y: currentBaseBasketPos.y + Math.sin(time * 4) * 120
        });
      } else if (currentLevel === 10) {
        setBasketPos({
          x: currentBaseBasketPos.x + Math.cos(time * 5) * 200,
          y: currentBaseBasketPos.y + Math.sin(time * 6) * 150
        });
      }
    }

    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const colors = ['#2c3e50', '#d35400', '#27ae60'];
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
      ctx.lineTo(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#fdf6e3';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.strokeStyle = '#ccc';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_WIDTH; x += 100) {
      ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 100) {
      ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#333';
    ctx.font = '24px "ZCOOL KuaiLe"';
    ctx.save();
    ctx.translate(CANVAS_WIDTH - 50, CANVAS_HEIGHT / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText("请让青蛙跳进它的小床里！", 0, 0);
    ctx.restore();

    ctx.strokeStyle = 'rgba(231, 76, 60, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(800, 0);
    ctx.lineTo(800, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(231, 76, 60, 0.6)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText("移动边界线", 810, 20);
    
    ctx.restore();

    ctx.save();
    ctx.translate(basketPos.x, basketPos.y);
    
    const bSize = 110; 
    const depth = 35;
    const perspective = 0.3;
    
    ctx.fillStyle = '#e0e0e0'; 
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-bSize + depth * perspective, -bSize + depth);
    ctx.lineTo(bSize - depth * perspective, -bSize + depth);
    ctx.lineTo(bSize, -bSize);
    ctx.lineTo(-bSize, -bSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.moveTo(-bSize, -bSize);
    ctx.lineTo(-bSize + depth * perspective, -bSize + depth);
    ctx.lineTo(-bSize + depth * perspective, bSize - depth);
    ctx.lineTo(-bSize, bSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bSize, -bSize);
    ctx.lineTo(bSize - depth * perspective, -bSize + depth);
    ctx.lineTo(bSize - depth * perspective, bSize - depth);
    ctx.lineTo(bSize, bSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(-bSize + depth * perspective, -bSize + depth);
    ctx.lineTo(bSize - depth * perspective, -bSize + depth);
    ctx.lineTo(bSize - depth * perspective, bSize - depth);
    ctx.lineTo(-bSize + depth * perspective, bSize - depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 25;
    ctx.shadowColor = 'rgba(52, 152, 219, 0.6)';
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.strokeRect(-bSize, -bSize, bSize * 2, bSize * 2);
    ctx.shadowBlur = 0;
    
    ctx.restore(); 
    
    ctx.save();
    ctx.translate(frogPos.x, frogPos.y);
    
    if (gameState === 'aiming') {
      const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, 60 + pulse * 15, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(39, 174, 96, ${0.3 - pulse * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (gameState === 'jumping') {
      ctx.rotate(Math.atan2(frogVel.y, frogVel.x) + Math.PI);
    } else if (gameState === 'aiming') {
      const angleToBasket = Math.atan2(basketPos.y - frogPos.y, basketPos.x - frogPos.x);
      ctx.rotate(angleToBasket + Math.PI / 2);
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    const frogScale = 1 - successAnimProgress * 0.5;
    ctx.scale(frogScale, frogScale);
    
    ctx.fillStyle = '#e0f2f1';
    ctx.beginPath();
    ctx.moveTo(0, -50); 
    ctx.lineTo(40, 30); 
    ctx.lineTo(-40, 30); 
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(24, -10);
    ctx.lineTo(-24, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(24, -10);
    ctx.lineTo(44, 36);
    ctx.lineTo(0, 16);
    ctx.lineTo(-44, 36);
    ctx.lineTo(-24, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(0, 16);
    ctx.strokeStyle = 'rgba(46, 125, 50, 0.3)';
    ctx.stroke();

    ctx.strokeStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(36, 20); ctx.lineTo(56, 44); ctx.lineTo(30, 40);
    ctx.moveTo(-36, 20); ctx.lineTo(-56, 44); ctx.lineTo(-30, 40);
    ctx.stroke();

    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(-12, -30, 6, 0, Math.PI * 2);
    ctx.arc(12, -30, 6, 0, Math.PI * 2);
    ctx.fill();
    
    if (gameState === 'aiming') {
      ctx.save();
      ctx.rotate(-(gameState === 'aiming' ? Math.atan2(basketPos.y - frogPos.y, basketPos.x - frogPos.x) + Math.PI / 2 : 0));
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 32px "ZCOOL KuaiLe"';
      ctx.textAlign = 'center';
      ctx.fillText("GO!", 0, 100);
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(basketPos.x, basketPos.y);
    
    ctx.fillStyle = '#ffffff'; 
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-bSize, bSize - depth, bSize * 2, depth); 
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#f8f8f8';
    ctx.beginPath();
    ctx.moveTo(-bSize, -bSize);
    ctx.lineTo(bSize, -bSize);
    ctx.lineTo(bSize + 10, -bSize - 20);
    ctx.lineTo(-bSize - 10, -bSize - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-bSize, -bSize);
    ctx.lineTo(-bSize, bSize);
    ctx.lineTo(-bSize - 20, bSize + 10);
    ctx.lineTo(-bSize - 20, -bSize - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bSize, -bSize);
    ctx.lineTo(bSize, bSize);
    ctx.lineTo(bSize + 20, bSize + 10);
    ctx.lineTo(bSize + 20, -bSize - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();

    obstacles.forEach(obs => {
      ctx.save();
      if (obs.type === 'pencil') {
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-obs.width / 2, -obs.height / 2 + 30, obs.width, obs.height - 60);
        
        ctx.fillStyle = '#e0c090';
        ctx.beginPath();
        ctx.moveTo(-obs.width / 2, -obs.height / 2 + 30);
        ctx.lineTo(0, -obs.height / 2);
        ctx.lineTo(obs.width / 2, -obs.height / 2 + 30);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(-obs.width / 4, -obs.height / 2 + 15);
        ctx.lineTo(0, -obs.height / 2);
        ctx.lineTo(obs.width / 4, -obs.height / 2 + 15);
        ctx.fill();
        
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(-obs.width / 2, obs.height / 2 - 30, obs.width, 10);
        
        ctx.fillStyle = '#ff80ab';
        ctx.beginPath();
        ctx.roundRect(-obs.width / 2, obs.height / 2 - 20, obs.width, 20, [0, 0, 5, 5]);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-obs.width / 6, -obs.height / 2 + 30);
        ctx.lineTo(-obs.width / 6, obs.height / 2 - 30);
        ctx.moveTo(obs.width / 6, -obs.height / 2 + 30);
        ctx.lineTo(obs.width / 6, obs.height / 2 - 30);
        ctx.stroke();

      } else if (obs.type === 'stone') {
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.fillStyle = '#7f8c8d';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(-obs.width / 2, 0);
        ctx.bezierCurveTo(-obs.width / 2, -obs.height / 2, -obs.width / 4, -obs.height / 2 - 10, 0, -obs.height / 2);
        ctx.bezierCurveTo(obs.width / 4, -obs.height / 2 + 5, obs.width / 2, -obs.height / 2, obs.width / 2, 0);
        ctx.bezierCurveTo(obs.width / 2, obs.height / 2, obs.width / 4, obs.height / 2 + 10, 0, obs.height / 2);
        ctx.bezierCurveTo(-obs.width / 4, obs.height / 2 - 5, -obs.width / 2, obs.height / 2, -obs.width / 2, 0);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(-obs.width / 3, -obs.height / 4);
        ctx.lineTo(-obs.width / 6, -obs.height / 3);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(obs.width / 4, obs.height / 4, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (gameState === 'aiming') {
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      let tx = frogPos.x;
      let ty = frogPos.y;
      const rad = (angle * Math.PI) / 180;
      let tvx = -Math.cos(rad) * (power / 8);
      let tvy = -Math.sin(rad) * (power / 8);
      
      ctx.moveTo(tx, ty);
      for (let i = 0; i < 40; i++) { 
        tx += tvx + wind;
        ty += tvy;
        tvy += GRAVITY;
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (wind !== 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const wy = 150 + i * 80;
        ctx.moveTo(wind > 0 ? 50 : 750, wy);
        ctx.bezierCurveTo(400, wy + 20, 400, wy - 20, wind > 0 ? 750 : 50, wy);
        ctx.stroke();
      }
      ctx.restore();
    }

  }, [angle, power, frogPos, frogVel, basketPos, gameState, obstacles, wind, successAnimProgress]);

  const handleJump = () => {
    if (gameState !== 'aiming') return;
    const rad = (angle * Math.PI) / 180;
    setFrogVel({
      x: -Math.cos(rad) * (power / 8), 
      y: -Math.sin(rad) * (power / 8)
    });
    setGameState('jumping');
  };

  const nextLevel = () => {
    if (level < 10) {
      setLevel(l => l + 1);
    } else {
      alert("恭喜通关！");
      setLevel(1);
      setScore(0);
    }
  };

  const handleGaugeInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.bottom;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    let angleRad = Math.atan2(-dy, -dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    
    if (angleDeg < 0) angleDeg = 0;
    if (angleDeg > 180) angleDeg = 180;
    
    setAngle(angleDeg);
  };

  const handlePowerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const p = Math.max(10, Math.min(200, (x / rect.width) * 200)); 
    setPower(p);
  };

  const [isDraggingFrog, setIsDraggingFrog] = useState(false);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (gameState !== 'aiming') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    
    const dist = Math.sqrt(Math.pow(x - frogPos.x, 2) + Math.pow(y - frogPos.y, 2));
    if (dist < 30) {
      setIsDraggingFrog(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingFrog || gameState !== 'aiming') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    
    const constrainedX = Math.max(800, Math.min(1150, x));
    const constrainedY = Math.max(50, Math.min(450, y));
    setFrogPos({ x: constrainedX, y: constrainedY });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingFrog(false);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'aiming') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    
    const dist = Math.sqrt(Math.pow(x - frogPos.x, 2) + Math.pow(y - frogPos.y, 2));
    if (dist < 30) {
      setIsDraggingFrog(true);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingFrog || gameState !== 'aiming') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    
    const constrainedX = Math.max(800, Math.min(1150, x));
    const constrainedY = Math.max(50, Math.min(450, y));
    setFrogPos({ x: constrainedX, y: constrainedY });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-between p-2 pb-1 pencil-texture overflow-hidden">
      <div className="w-full max-w-[1200px] flex justify-between items-start shrink-0 text-white z-10">
        <div className="text-xl font-bold drop-shadow-lg">
          分数: {score}<br />
          关卡: {level}/10
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-white/90 text-gray-800 px-2 py-0.5 sketch-border text-sm font-bold floating font-sketch">
            {message}
          </div>
          <div className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full text-white/80">
            提示：拖动转盘瞄准，或直接拖动小青蛙调整位置
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1200px] min-h-0 flex items-center justify-center my-2">
        <div className="relative w-full aspect-[12/5] bg-white/10 rounded-xl overflow-hidden shadow-2xl sketch-border">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasMouseUp}
            className={`w-full h-full object-contain ${gameState === 'aiming' ? 'cursor-grab active:cursor-grabbing' : ''}`}
          />

          <AnimatePresence>
          {gameState === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20"
            >
              <motion.h2 
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="text-6xl text-yellow-400 font-bold mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] font-sketch"
              >
                成功入围！
              </motion.h2>
              <button 
                onClick={nextLevel}
                className="bg-green-500 hover:bg-green-600 text-white px-12 py-5 rounded-full text-3xl sketch-border transition-transform hover:scale-110 active:scale-95 shadow-xl font-sketch"
              >
                下一关 &gt;
              </button>
            </motion.div>
          )}

          {gameState === 'fail' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20"
            >
              <motion.h2 
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="text-6xl text-red-500 font-bold mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] font-sketch"
              >
                哎呀，失败了
              </motion.h2>
              <button 
                onClick={() => initLevel(level)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-5 rounded-full text-3xl sketch-border transition-transform hover:scale-110 active:scale-95 shadow-xl font-sketch"
              >
                再试一次
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

      <div className="w-full max-w-[1200px] grid grid-cols-3 gap-8 items-center bg-white/90 pt-10 pb-6 px-6 sketch-border mt-4 mb-2 shadow-2xl">
        <div className="relative flex flex-col items-center select-none">
          <div 
            className="w-48 h-24 relative overflow-hidden cursor-crosshair"
            onMouseDown={handleGaugeInteraction}
            onMouseMove={(e) => e.buttons === 1 && handleGaugeInteraction(e)}
            onTouchMove={handleGaugeInteraction}
          >
            <div className="absolute inset-0 rounded-t-full border-8 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 [mask-image:radial-gradient(farthest-side,transparent_70%,black_71%)]"></div>
            
            <div 
              className="absolute bottom-0 left-1/2 w-1.5 h-20 bg-green-600 origin-bottom transition-transform duration-100 pointer-events-none"
              style={{ transform: `translateX(-50%) rotate(${angle - 90}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 rotate-45"></div>
            </div>
          </div>
          
          <div className="flex justify-between w-full text-[10px] font-bold mt-1 text-gray-600">
            <span>90°</span>
            <span>0°</span>
            <span>90°</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="180" 
            step="1"
            value={angle} 
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full mt-2 accent-green-600 cursor-pointer h-2"
          />
        </div>

        <div className="flex flex-col items-center select-none">
          <span className="text-3xl font-bold mb-2 text-gray-800 font-sketch">力</span>
          <div 
            className="w-full h-10 bg-gray-200 rounded-full overflow-hidden relative sketch-border cursor-pointer"
            onMouseDown={handlePowerInteraction}
            onMouseMove={(e) => e.buttons === 1 && handlePowerInteraction(e)}
            onTouchMove={handlePowerInteraction}
          >
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
              style={{ width: `${(power / 200) * 100}%` }}
            ></div>
          </div>
          <input 
            type="range" 
            min="10" 
            max="200" 
            value={power} 
            onChange={(e) => setPower(Number(e.target.value))}
            className="w-full mt-2 accent-orange-600 cursor-pointer h-2"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleJump}
            disabled={gameState !== 'aiming'}
            className={`
              w-full py-5 text-3xl font-bold rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]
              transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-sketch
              ${gameState === 'aiming' ? 'bg-white text-gray-800 hover:bg-gray-50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              sketch-border
            `}
          >
            跳跃 &gt;
          </button>
          <div className="text-[12px] font-bold text-gray-600 mt-1">
            下面由叶纯熙的创意启发
          </div>
          <button 
            onClick={() => initLevel(level)}
            className="text-xs text-gray-500 hover:text-gray-800 underline mt-2"
          >
            重置本关
          </button>
        </div>
      </div>

      <div className="text-white/40 text-[10px] pb-1">
        Inspired by Ye Chunxi's Creation
      </div>
    </div>
  );
}
