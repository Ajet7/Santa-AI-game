
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerState, Obstacle, PowerUp, ShootingStar, GameState } from '@/types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_INITIAL_X,
  GROUND_SURFACE_Y,
  JUMP_FORCE, 
  GRAVITY,    
  LEG_ANIMATION_CYCLE_FRAMES,
  ARM_SWING_ANGLE,
  LEG_SWING_ANGLE,
  BODY_BOB_AMOUNT,
  INITIAL_OBSTACLE_SPEED,
  MAX_OBSTACLE_SPEED,
  OBSTACLE_SPAWN_INTERVAL_MIN,
  OBSTACLE_SPAWN_INTERVAL_MAX,
  TIME_BASED_SPEED_INCREASE_INTERVAL_FRAMES,
  TIME_BASED_SPEED_INCREASE_AMOUNT,
  GENERIC_COLLECTIBLE_ITEM_WIDTH,
  GENERIC_COLLECTIBLE_ITEM_HEIGHT,
  GENERIC_COLLECTIBLE_ITEM_OUTLINE_COLOR,
  GENERIC_COLLECTIBLE_ITEM_TAB_HEIGHT,
  GENERIC_COLLECTIBLE_ITEM_TAB_WIDTH_FACTOR,
  COLLECTIBLE_FILE_TYPES,
  COLLECTIBLE_ITEM_SPAWN_INTERVAL_MIN,
  COLLECTIBLE_ITEM_SPAWN_INTERVAL_MAX,
  SPEED_INCREMENT_PER_COLLECTIBLE,
  SANTA_SUIT_COLOR,
  SANTA_FUR_TRIM_COLOR,
  SANTA_BELT_COLOR,
  SANTA_BELT_BUCKLE_COLOR,
  SANTA_BOOT_COLOR,
  SANTA_SKIN_COLOR,
  SANTA_BEARD_COLOR,
  SANTA_HAT_POMPOM_COLOR,
  BUILDING_MIN_WIDTH,
  BUILDING_MAX_WIDTH,
  BUILDING_HEIGHT,
  BUILDING_BODY_COLOR,
  BUILDING_ROOF_COLOR,
  BUILDING_WINDOW_COLOR,
  BUILDING_WINDOW_OFF_COLOR,
  BUILDING_OUTLINE_COLOR,
  GROUND_LEVEL_THICKNESS,
  GRASS_COLOR,
  NUM_STARS,
  STAR_MIN_SIZE,
  STAR_MAX_SIZE,
  STAR_COLORS,
  MAX_SHOOTING_STARS,
  SHOOTING_STAR_SPAWN_INTERVAL_MIN,
  SHOOTING_STAR_SPAWN_INTERVAL_MAX,
  SHOOTING_STAR_MIN_SPEED,
  SHOOTING_STAR_MAX_SPEED,
  SHOOTING_STAR_MIN_LENGTH,
  SHOOTING_STAR_MAX_LENGTH,
  SHOOTING_STAR_COLOR,
  SANTA_BAG_COLOR,
  SANTA_BAG_INITIAL_WIDTH_FACTOR,
  SANTA_BAG_INITIAL_HEIGHT_FACTOR,
  SANTA_BAG_GROWTH_PER_FOLDER_WIDTH_FACTOR,
  SANTA_BAG_GROWTH_PER_FOLDER_HEIGHT_FACTOR,
  SANTA_BAG_OFFSET_X_FACTOR,
  SANTA_BAG_OFFSET_Y_FACTOR,
  BAG_FOLDER_ICON_WIDTH,
  BAG_FOLDER_ICON_HEIGHT,
  BAG_FOLDER_ICON_COLOR,
  BAG_FOLDER_ICON_SPACING,
  FOLDER_CAPACITY
} from '@/constants';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: () => void; // Called on collision
  onFileCollected: () => void; // Any file type
  totalFilesCollected: number;
}

export default function GameCanvas({
  gameState,
  onGameOver,
  onFileCollected,
  totalFilesCollected,
}: GameCanvasProps): React.JSX.Element {
  const [player, setPlayer] = useState<PlayerState>({
    y: GROUND_SURFACE_Y - PLAYER_HEIGHT,
    velocityY: 0,
    isJumping: false,
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [nextObstacleFrame, setNextObstacleFrame] = useState<number>(0);
  const [nextCollectibleItemFrame, setNextCollectibleItemFrame] = useState<number>(0);
  const [currentActualSpeed, setCurrentActualSpeed] = useState<number>(INITIAL_OBSTACLE_SPEED);
  const [staticStars, setStaticStars] = useState<{ x: number; y: number; size: number; color: string }[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [nextShootingStarFrame, setNextShootingStarFrame] = useState<number>(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastSpeedIncreaseFrameRef = useRef<number>(0);
  const fixedCollectibleYRef = useRef<number>(0);


  const getRandomCollectibleType = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * COLLECTIBLE_FILE_TYPES.length);
    return COLLECTIBLE_FILE_TYPES[randomIndex]; 
  }, []);


  useEffect(() => {
    const playerPeakJumpY = (GROUND_SURFACE_Y - PLAYER_HEIGHT) - (JUMP_FORCE * JUMP_FORCE) / (2 * GRAVITY);
    fixedCollectibleYRef.current = playerPeakJumpY;

    const stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * (GROUND_SURFACE_Y - 20),
        size: Math.random() * (STAR_MAX_SIZE - STAR_MIN_SIZE) + STAR_MIN_SIZE,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      });
    }
    setStaticStars(stars);
    setNextShootingStarFrame(Math.floor(Math.random() * (SHOOTING_STAR_SPAWN_INTERVAL_MAX - SHOOTING_STAR_SPAWN_INTERVAL_MIN)) + SHOOTING_STAR_SPAWN_INTERVAL_MIN);

    setNextObstacleFrame(Math.floor(Math.random() * (OBSTACLE_SPAWN_INTERVAL_MAX - OBSTACLE_SPAWN_INTERVAL_MIN) + OBSTACLE_SPAWN_INTERVAL_MIN));
    setNextCollectibleItemFrame(COLLECTIBLE_ITEM_SPAWN_INTERVAL_MIN + Math.floor(Math.random()*(COLLECTIBLE_ITEM_SPAWN_INTERVAL_MAX-COLLECTIBLE_ITEM_SPAWN_INTERVAL_MIN)));

    setCurrentActualSpeed(INITIAL_OBSTACLE_SPEED);
    setPlayer({ y: GROUND_SURFACE_Y - PLAYER_HEIGHT, velocityY: 0, isJumping: false });
    setObstacles([]);
    setPowerUps([]);
    setShootingStars([]);
    setFrameCount(0); 
    lastSpeedIncreaseFrameRef.current = 0;
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }; 
  }, []); 

  const handleJump = useCallback(() => {
    setPlayer((prev) => {
      if (!prev.isJumping && prev.y >= GROUND_SURFACE_Y - PLAYER_HEIGHT - 5 && gameState === GameState.Playing) { 
        return { ...prev, velocityY: -JUMP_FORCE, isJumping: true };
      }
      return prev;
    });
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === GameState.Playing) {
          e.preventDefault();
          handleJump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, gameState]);

  useEffect(() => {
    if (gameState !== GameState.Playing) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return;
    }

    const gameLoop = () => {
      setFrameCount(prev => prev + 1);
      
      if (gameState === GameState.Playing) {
        if (frameCount - lastSpeedIncreaseFrameRef.current >= TIME_BASED_SPEED_INCREASE_INTERVAL_FRAMES) {
          setCurrentActualSpeed(prevSpeed => Math.min(MAX_OBSTACLE_SPEED, prevSpeed + TIME_BASED_SPEED_INCREASE_AMOUNT));
          lastSpeedIncreaseFrameRef.current = frameCount;
        }

        setPlayer((prev) => {
          let newVelocityY = prev.velocityY + GRAVITY;
          let newY = prev.y + newVelocityY;
          let newIsJumping = prev.isJumping;

          if (newY >= GROUND_SURFACE_Y - PLAYER_HEIGHT) {
            newY = GROUND_SURFACE_Y - PLAYER_HEIGHT;
            newVelocityY = 0;
            newIsJumping = false;
          }
           if (newY <= 0) { 
              newY = 0;
              if (newVelocityY < 0) newVelocityY = 0; 
          }
          return { ...prev, y: newY, velocityY: newVelocityY, isJumping: newIsJumping };
        });

        setObstacles((prevObstacles) => {
          return prevObstacles
            .map((obstacle) => ({ ...obstacle, x: obstacle.x - currentActualSpeed, width: obstacle.width, height: obstacle.height }))
            .filter((obstacle) => obstacle.x + (obstacle.width || 0) > 0);
        });

        setPowerUps((prevPowerUps) =>
          prevPowerUps
            .map((pu) => ({ ...pu, x: pu.x - currentActualSpeed })) 
            .filter((pu) => pu.x + pu.width > 0 && !pu.collected)
        );
      
        if (frameCount >= nextObstacleFrame) {
          const buildingWidth = Math.floor(Math.random() * (BUILDING_MAX_WIDTH - BUILDING_MIN_WIDTH + 1)) + BUILDING_MIN_WIDTH;
          const newObstacle: Obstacle = {
            id: Date.now(),
            x: GAME_WIDTH,
            width: buildingWidth,
            height: BUILDING_HEIGHT,
          };
          setObstacles((prevObstacles) => [...prevObstacles, newObstacle]);
          setNextObstacleFrame(frameCount + Math.floor(Math.random() * (OBSTACLE_SPAWN_INTERVAL_MAX - OBSTACLE_SPAWN_INTERVAL_MIN) + OBSTACLE_SPAWN_INTERVAL_MIN) / (currentActualSpeed / INITIAL_OBSTACLE_SPEED) );
        }

        if (frameCount >= nextCollectibleItemFrame) { 
          const randomFileType = getRandomCollectibleType();
          const spawnY = fixedCollectibleYRef.current; 
          const newPowerUp: PowerUp = {
              id: Date.now() + 1, 
              x: GAME_WIDTH,
              y: spawnY, 
              width: GENERIC_COLLECTIBLE_ITEM_WIDTH,
              height: GENERIC_COLLECTIBLE_ITEM_HEIGHT,
              type: 'speed_boost',
              collected: false,
              collectibleFileType: randomFileType.id,
          };
          setPowerUps(prevPUs => [...prevPUs, newPowerUp]);
          setNextCollectibleItemFrame(frameCount + Math.floor(Math.random() * (COLLECTIBLE_ITEM_SPAWN_INTERVAL_MAX - COLLECTIBLE_ITEM_SPAWN_INTERVAL_MIN) + COLLECTIBLE_ITEM_SPAWN_INTERVAL_MIN) / (currentActualSpeed / INITIAL_OBSTACLE_SPEED));
        }

        const playerRect = { 
          x: PLAYER_INITIAL_X + PLAYER_WIDTH * 0.1, 
          y: player.y + PLAYER_HEIGHT * 0.05,
          width: PLAYER_WIDTH * 0.65, 
          height: PLAYER_HEIGHT * 0.9,
        };

        for (const obstacle of obstacles) {
          const obstacleRect = {
            x: obstacle.x,
            y: GROUND_SURFACE_Y - (obstacle.height || BUILDING_HEIGHT),
            width: obstacle.width || BUILDING_MIN_WIDTH,
            height: obstacle.height || BUILDING_HEIGHT,
          };
          if (
            playerRect.x < obstacleRect.x + obstacleRect.width &&
            playerRect.x + playerRect.width > obstacleRect.x &&
            playerRect.y < obstacleRect.y + obstacleRect.height &&
            playerRect.y + playerRect.height > obstacleRect.y
          ) {
             if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
             onGameOver(); 
             return;
          }
        }

        for (const pu of powerUps) {
          if (pu.collected) continue;
          const powerUpRect = { x: pu.x, y: pu.y, width: pu.width, height: pu.height };
          if (
            playerRect.x < powerUpRect.x + powerUpRect.width &&
            playerRect.x + playerRect.width > powerUpRect.x &&
            playerRect.y < powerUpRect.y + powerUpRect.height &&
            playerRect.y + playerRect.height > powerUpRect.y
          ) {
            setPowerUps(prev => prev.map(p => p.id === pu.id ? {...p, collected: true} : p));
            if (pu.type === 'speed_boost' && pu.collectibleFileType) {
              setCurrentActualSpeed(prevSpeed => Math.min(MAX_OBSTACLE_SPEED, prevSpeed + SPEED_INCREMENT_PER_COLLECTIBLE));
              onFileCollected();
            }
          }
        }
      } 

      setShootingStars(prev =>
        prev.map(ss => ({
          ...ss,
          x: ss.x - ss.speed * Math.cos(ss.angle * Math.PI / 180),
          y: ss.y + ss.speed * Math.sin(ss.angle * Math.PI / 180),
          life: ss.life - 1,
          opacity: Math.max(0, ss.opacity - 0.01),
        })).filter(ss => ss.life > 0 && ss.x > -ss.length && ss.y < GAME_HEIGHT + ss.length)
      );

      if (gameState === GameState.Playing && frameCount >= nextShootingStarFrame && shootingStars.length < MAX_SHOOTING_STARS) {
        const newShootingStar: ShootingStar = {
          id: Date.now(),
          x: Math.random() * GAME_WIDTH,
          y: -20, 
          length: Math.random() * (SHOOTING_STAR_MAX_LENGTH - SHOOTING_STAR_MIN_LENGTH) + SHOOTING_STAR_MIN_LENGTH,
          angle: Math.random() * 45 + 20, 
          speed: Math.random() * (SHOOTING_STAR_MAX_SPEED - SHOOTING_STAR_MIN_SPEED) + SHOOTING_STAR_MIN_SPEED,
          opacity: 1,
          life: 100, 
        };
        setShootingStars(prev => [...prev, newShootingStar]);
        setNextShootingStarFrame(frameCount + Math.floor(Math.random() * (SHOOTING_STAR_SPAWN_INTERVAL_MAX - SHOOTING_STAR_SPAWN_INTERVAL_MIN)) + SHOOTING_STAR_SPAWN_INTERVAL_MIN);
      }
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, frameCount, onGameOver, onFileCollected, handleJump, currentActualSpeed, obstacles, powerUps, shootingStars, nextCollectibleItemFrame, nextObstacleFrame, nextShootingStarFrame, player.y, getRandomCollectibleType]);

  const playerStyle: React.CSSProperties = {
    left: PLAYER_INITIAL_X,
    bottom: GAME_HEIGHT - (player.y + PLAYER_HEIGHT), 
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    position: 'absolute',
    zIndex: 5, 
  };

  const darkenColor = (color: string, percent: number): string => {
    if (color.startsWith('#') && color.length === 7) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        R = parseInt((R * (100 - percent) / 100).toString());
        G = parseInt((G * (100 - percent) / 100).toString());
        B = parseInt((B * (100 - percent) / 100).toString());
        R = Math.max(0, Math.min(255, R)); 
        G = Math.max(0, Math.min(255, G));
        B = Math.max(0, Math.min(255, B));
        const RR = R.toString(16).padStart(2, '0');
        const GG = G.toString(16).padStart(2, '0');
        const BB = B.toString(16).padStart(2, '0');
        return "#" + RR + GG + BB;
    }
    return color; 
  };

  const renderSantaCharacter = () => {
    const headRadius = PLAYER_HEIGHT * 0.15;
    const hatHeight = headRadius * 1.8;
    const hatWidth = headRadius * 1.5;
    const pompomRadius = headRadius * 0.3;
    const furTrimHeight = headRadius * 0.3;

    const bodyWidth = PLAYER_WIDTH * 0.65;
    const bodyHeight = PLAYER_HEIGHT * 0.45;

    const armWidth = PLAYER_WIDTH * 0.2;
    const armHeight = bodyHeight * 0.9;
    const handRadius = armWidth * 0.6;

    const legWidth = PLAYER_WIDTH * 0.25;
    const legHeight = PLAYER_HEIGHT * 0.38;
    const bootHeight = legHeight * 0.4;
    const bootWidth = legWidth * 1.3; 
    
    const foldersForVisuals = Math.floor(totalFilesCollected / FOLDER_CAPACITY);

    const bagCurrentWidthFactor = SANTA_BAG_INITIAL_WIDTH_FACTOR + (foldersForVisuals * SANTA_BAG_GROWTH_PER_FOLDER_WIDTH_FACTOR);
    const bagCurrentHeightFactor = SANTA_BAG_INITIAL_HEIGHT_FACTOR + (foldersForVisuals * SANTA_BAG_GROWTH_PER_FOLDER_HEIGHT_FACTOR);
    
    const bagActualWidth = PLAYER_WIDTH * bagCurrentWidthFactor;
    const bagActualHeight = PLAYER_HEIGHT * bagCurrentHeightFactor;

    const bagLeftX = (PLAYER_WIDTH / 2) - (bagActualWidth / 2) + (PLAYER_WIDTH * SANTA_BAG_OFFSET_X_FACTOR);
    const bagTopY = PLAYER_HEIGHT * SANTA_BAG_OFFSET_Y_FACTOR;

    let leg1Angle = 0, leg2Angle = 0, arm1Angle = 0, arm2Angle = 0, bodyBobOffset = 0;

    const cycleProgress = (frameCount % LEG_ANIMATION_CYCLE_FRAMES) / LEG_ANIMATION_CYCLE_FRAMES;
    if (!player.isJumping && gameState === GameState.Playing) { 
      leg1Angle = Math.sin(cycleProgress * Math.PI * 2) * LEG_SWING_ANGLE; 
      leg2Angle = Math.sin((cycleProgress + 0.5) * Math.PI * 2) * LEG_SWING_ANGLE; 
      arm1Angle = Math.sin((cycleProgress + 0.5) * Math.PI * 2) * ARM_SWING_ANGLE; 
      arm2Angle = Math.sin(cycleProgress * Math.PI * 2) * ARM_SWING_ANGLE;
      bodyBobOffset = Math.sin(cycleProgress * Math.PI * 2) * BODY_BOB_AMOUNT;
    } else if (player.isJumping && gameState === GameState.Playing) { 
      leg1Angle = -15; 
      leg2Angle = 10;
      arm1Angle = -ARM_SWING_ANGLE / 1.5;
      arm2Angle = ARM_SWING_ANGLE / 2;
      bodyBobOffset = 0; 
    } else { 
        leg1Angle = 0; leg2Angle = 0; arm1Angle = 0; arm2Angle = 0; bodyBobOffset = 0;
    }
    
    const bagFolderIcons = [];
    if (foldersForVisuals > 0) { 
      const maxIconsPerRow = Math.floor(bagActualWidth / (BAG_FOLDER_ICON_WIDTH + BAG_FOLDER_ICON_SPACING));
      for (let i = 0; i < foldersForVisuals; i++) {
        const row = Math.floor(i / maxIconsPerRow);
        const col = i % maxIconsPerRow;
        bagFolderIcons.push(
          <div key={`bag-folder-${i}`} style={{
            position: 'absolute',
            width: BAG_FOLDER_ICON_WIDTH,
            height: BAG_FOLDER_ICON_HEIGHT,
            backgroundColor: BAG_FOLDER_ICON_COLOR,
            borderRadius: '1px',
            left: BAG_FOLDER_ICON_SPACING + col * (BAG_FOLDER_ICON_WIDTH + BAG_FOLDER_ICON_SPACING),
            top: BAG_FOLDER_ICON_SPACING + row * (BAG_FOLDER_ICON_HEIGHT + BAG_FOLDER_ICON_SPACING),
            boxShadow: '1px 1px 1px rgba(0,0,0,0.5)'
          }}/>
        );
      }
    }
    
    const mainBodyTopY = hatHeight * 0.9 - headRadius * 0.5 - bodyBobOffset;
    const headTopY = hatHeight * 0.9 - headRadius * 1.5 - bodyBobOffset;
    const armTopY = hatHeight * 0.9 - headRadius * 0.4 - bodyBobOffset;


    return (
      <div style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT, position: 'relative', transform: 'scaleX(-1)' }} role="img" aria-label="Santa Claus character (facing left)">
        
        <div style={{
            position: 'absolute',
            width: legWidth,
            height: legHeight,
            backgroundColor: SANTA_SUIT_COLOR,
            left: (PLAYER_WIDTH / 2) - (legWidth / 2) - legWidth * 0.1, 
            bottom: bootHeight * 0.1 + bodyBobOffset, 
            transformOrigin: '50% 10%', 
            transform: `rotate(${leg1Angle}deg)`,
            borderRadius: '5px 5px 0 0',
            zIndex: -2, 
        }}>
            <div style={{position: 'absolute', width: bootWidth, height: bootHeight, backgroundColor: SANTA_BOOT_COLOR, borderRadius: '5px 3px 3px 5px', bottom: -bootHeight*0.1, left: (legWidth - bootWidth) / 2 + (bootWidth * 0.1) }}/>
            <div style={{position: 'absolute', width: legWidth * 1.1, height: furTrimHeight * 0.5, backgroundColor: SANTA_FUR_TRIM_COLOR, top: legHeight - bootHeight - furTrimHeight * 0.1, left: -legWidth * 0.05, borderRadius: '2px'}}/>
        </div>
        <div style={{
            position: 'absolute',
            width: armWidth * 0.9, 
            height: armHeight,
            backgroundColor: SANTA_SUIT_COLOR,
            borderRadius: '5px',
            left: (PLAYER_WIDTH / 2) - (armWidth * 0.9 / 2) + PLAYER_WIDTH * 0.02, 
            top: armTopY, 
            transformOrigin: '50% 15%', 
            transform: `rotate(${arm2Angle}deg)`, 
            zIndex: -1, 
        }}>
            <div style={{position: 'absolute', width: handRadius * 1.8, height: handRadius * 1.8, backgroundColor: SANTA_SKIN_COLOR, borderRadius: '50%', bottom: handRadius * 0.2, left: (armWidth*0.9 - handRadius*1.8)/2 }}/>
            <div style={{position: 'absolute', width: armWidth * 0.9 * 1.1, height: furTrimHeight * 0.6, backgroundColor: SANTA_FUR_TRIM_COLOR, borderRadius: '3px', bottom: handRadius * 1.5, left: (armWidth*0.9 * -0.05) }}/>
        </div>

        <div style={{
          position: 'absolute',
          width: bagActualWidth,
          height: bagActualHeight,
          backgroundColor: SANTA_BAG_COLOR,
          left: bagLeftX, 
          top: bagTopY + bodyHeight * 0.2 - bodyBobOffset, 
          borderRadius: '5px 5px 15px 15px',
          zIndex: 0, 
          border: `2px solid ${darkenColor(SANTA_BAG_COLOR, 30)}`,
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          padding: BAG_FOLDER_ICON_SPACING / 2,
          alignContent: 'flex-start',
          transition: 'width 0.2s ease-out, height 0.2s ease-out',
        }}>
          {bagFolderIcons}
        </div>
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
            <div style={{ position: 'absolute', width: hatWidth * 0.8, height: hatHeight * 0.9, backgroundColor: SANTA_SUIT_COLOR, left: PLAYER_WIDTH * 0.4 - (hatWidth * 0.8 / 2), top: 0 - bodyBobOffset, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'rotate(-15deg)', transformOrigin: 'bottom center' }} />
            <div style={{ position: 'absolute', width: hatWidth, height: furTrimHeight, backgroundColor: SANTA_FUR_TRIM_COLOR, left: PLAYER_WIDTH * 0.4 - (hatWidth / 2), top: hatHeight * 0.9 - furTrimHeight * 1.2 - bodyBobOffset, borderRadius: '5px', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: pompomRadius * 2, height: pompomRadius * 2, backgroundColor: SANTA_HAT_POMPOM_COLOR, borderRadius: '50%', left: PLAYER_WIDTH * 0.4 - pompomRadius - hatWidth * 0.3, top: -pompomRadius * 0.2 - bodyBobOffset, zIndex: 2 }}/>
            <div style={{ position: 'absolute', width: headRadius * 2, height: headRadius * 2, backgroundColor: SANTA_SKIN_COLOR, borderRadius: '50%', left: PLAYER_WIDTH * 0.4 - headRadius, top: headTopY, zIndex: 0 }} />
            <div style={{ position: 'absolute', width: headRadius * 0.4, height: headRadius * 0.5, backgroundColor: darkenColor(SANTA_SKIN_COLOR, 10), borderRadius: '50%', left: PLAYER_WIDTH * 0.4 + headRadius * 0.6, top: headTopY + headRadius * 0.5, zIndex: 2 }}/>
            <div style={{ position: 'absolute', width: headRadius * 1.5, height: headRadius * 1.8, backgroundColor: SANTA_BEARD_COLOR, borderRadius: '0 50% 50% 50% / 0 60% 40% 60%', left: PLAYER_WIDTH * 0.4 - headRadius * 0.7, top: headTopY + headRadius * 0.7, transform: 'skewX(-10deg)', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: bodyWidth, height: bodyHeight, backgroundColor: SANTA_SUIT_COLOR, borderRadius: '10px', left: (PLAYER_WIDTH - bodyWidth) / 2 + PLAYER_WIDTH * 0.05, top: mainBodyTopY, zIndex: 1 }} />
            <div style={{ position: 'absolute', width: bodyWidth * 1.1, height: bodyHeight * 0.15, backgroundColor: SANTA_BELT_COLOR, left: (PLAYER_WIDTH - bodyWidth * 1.1) / 2 + PLAYER_WIDTH * 0.05, top: mainBodyTopY + bodyHeight * 0.4, zIndex: 2, borderRadius: '2px' }} />
            <div style={{ position: 'absolute', width: bodyHeight * 0.12, height: bodyHeight * 0.12, backgroundColor: SANTA_BELT_BUCKLE_COLOR, left: (PLAYER_WIDTH - bodyWidth)/2 + bodyWidth * 0.7, top: mainBodyTopY + bodyHeight * 0.4 + (bodyHeight*0.15 - bodyHeight*0.12)/2, zIndex: 3, border: '1px solid #DAA520' }} />
            <div style={{ position: 'absolute', width: bodyWidth, height: furTrimHeight * 0.7, backgroundColor: SANTA_FUR_TRIM_COLOR, left: (PLAYER_WIDTH - bodyWidth) / 2 + PLAYER_WIDTH * 0.05, bottom: PLAYER_HEIGHT - (mainBodyTopY + bodyHeight) + furTrimHeight * 0.1, borderRadius: '3px', zIndex: 2 }} />
        </div>

         <div style={{
            position: 'absolute',
            width: legWidth,
            height: legHeight,
            backgroundColor: SANTA_SUIT_COLOR,
            left: (PLAYER_WIDTH / 2) - (legWidth / 2) + legWidth * 0.1, 
            bottom: bootHeight * 0.1 + bodyBobOffset, 
            transformOrigin: '50% 10%', 
            transform: `rotate(${leg2Angle}deg)`,
            borderRadius: '5px 5px 0 0',
            zIndex: 3, 
          }}>
            <div style={{position: 'absolute', width: bootWidth, height: bootHeight, backgroundColor: SANTA_BOOT_COLOR, borderRadius: '5px 3px 3px 5px', bottom: -bootHeight*0.1, left: (legWidth - bootWidth) / 2 + (bootWidth * 0.1) }}/>
            <div style={{position: 'absolute', width: legWidth * 1.1, height: furTrimHeight * 0.5, backgroundColor: SANTA_FUR_TRIM_COLOR, top: legHeight - bootHeight - furTrimHeight * 0.1, left: -legWidth * 0.05, borderRadius: '2px'}}/>
        </div>
        <div style={{
            position: 'absolute',
            width: armWidth, 
            height: armHeight,
            backgroundColor: SANTA_SUIT_COLOR,
            borderRadius: '5px',
            left: (PLAYER_WIDTH / 2) - (armWidth / 2) + PLAYER_WIDTH * 0.08, 
            top: armTopY, 
            transformOrigin: '50% 15%', 
            transform: `rotate(${arm1Angle}deg)`, 
            zIndex: 4, 
          }}>
            <div style={{position: 'absolute', width: handRadius * 2, height: handRadius * 2, backgroundColor: SANTA_SKIN_COLOR, borderRadius: '50%', bottom: handRadius * 0.2, left: (armWidth - handRadius * 2) / 2 }}/>
            <div style={{position: 'absolute', width: armWidth * 1.1, height: furTrimHeight * 0.6, backgroundColor: SANTA_FUR_TRIM_COLOR, borderRadius: '3px', bottom: handRadius * 1.5, left: (armWidth * -0.05) }}/>
        </div>
      </div>
    );
  };

  const renderBuildingObstacle = (obstacle: Obstacle) => {
    const buildingActualWidth = obstacle.width || BUILDING_MIN_WIDTH;
    const buildingActualHeight = obstacle.height || BUILDING_HEIGHT;
    const windowSize = Math.min(buildingActualWidth * 0.15, buildingActualHeight * 0.1);
    const windowMargin = windowSize * 0.5;
    const numWindowRows = Math.floor((buildingActualHeight - buildingActualHeight*0.1 - windowMargin * 2) / (windowSize + windowMargin));
    const numWindowCols = Math.floor((buildingActualWidth - windowMargin * 2) / (windowSize + windowMargin));

    return (
      <div key={obstacle.id} style={{
        position: 'absolute',
        left: obstacle.x,
        bottom: GROUND_LEVEL_THICKNESS, 
        width: buildingActualWidth,
        height: buildingActualHeight,
        zIndex: 2, 
        backgroundColor: BUILDING_BODY_COLOR,
        border: `2px solid ${BUILDING_OUTLINE_COLOR}`,
        borderRadius: '2px 2px 0 0', 
      }} aria-hidden="true">
        <div style={{
            position: 'absolute',
            top: 0,
            left: -2, 
            right: -2, 
            height: buildingActualHeight * 0.08,
            backgroundColor: BUILDING_ROOF_COLOR,
            borderBottom: `2px solid ${BUILDING_OUTLINE_COLOR}`,
            borderRadius: '1px 1px 0 0',
        }}/>
        {Array.from({length: numWindowRows}).map((_, rowIndex) => (
            Array.from({length: numWindowCols}).map((__, colIndex) => (
                <div key={`win-${rowIndex}-${colIndex}`} style={{
                    position: 'absolute',
                    width: windowSize,
                    height: windowSize,
                    backgroundColor: Math.random() > 0.4 ? BUILDING_WINDOW_COLOR : BUILDING_WINDOW_OFF_COLOR, 
                    left: windowMargin + colIndex * (windowSize + windowMargin) + (buildingActualWidth - (numWindowCols * (windowSize + windowMargin) - windowMargin)) / 2 , 
                    top: buildingActualHeight * 0.1 + windowMargin + rowIndex * (windowSize + windowMargin), 
                    borderRadius: '1px',
                    boxShadow: Math.random() > 0.4 ? `0 0 3px ${BUILDING_WINDOW_COLOR}`: 'none', 
                }}/>
            ))
        ))}
      </div>
    );
  };

  const renderCollectibleItem = (pu: PowerUp) => {
    if (pu.collected || !pu.collectibleFileType) return null;

    const fileTypeDetails = COLLECTIBLE_FILE_TYPES.find(ft => ft.id === pu.collectibleFileType);
    if (!fileTypeDetails) return null; 

    const style: React.CSSProperties = {
      position: 'absolute',
      left: pu.x,
      top: pu.y,
      width: pu.width,
      height: pu.height,
      zIndex: 10, 
      backgroundColor: fileTypeDetails.baseColor,
      border: `2px solid ${GENERIC_COLLECTIBLE_ITEM_OUTLINE_COLOR}`,
      borderRadius: '3px',
      boxShadow: `0 0 8px ${fileTypeDetails.baseColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: fileTypeDetails.iconColor,
      fontWeight: 'bold',
      fontSize: pu.height * 0.45, 
      fontFamily: 'Arial, sans-serif',
      textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
      textAlign: 'center',
      padding: '0 2px',
      overflow: 'hidden',
      lineHeight: 1,
    };
    
    const tabActualColor = fileTypeDetails.tabColor || darkenColor(fileTypeDetails.baseColor, 20);
    const tabWidth = pu.width * GENERIC_COLLECTIBLE_ITEM_TAB_WIDTH_FACTOR;

    const tabStyle: React.CSSProperties = {
        position: 'absolute',
        top: `-${GENERIC_COLLECTIBLE_ITEM_TAB_HEIGHT}px`,
        left: '5px',
        width: tabWidth,
        height: `${GENERIC_COLLECTIBLE_ITEM_TAB_HEIGHT}px`,
        backgroundColor: tabActualColor,
        borderRadius: '2px 2px 0 0',
        border: `1px solid ${darkenColor(tabActualColor, 15)}`,
        borderBottom: 'none',
    };

    return (
      <div key={pu.id} style={style} aria-hidden="true" title={`${fileTypeDetails.label} Collectible`}>
        <div style={tabStyle} />
        {fileTypeDetails.label}
      </div>
    );
  };
  

  return (
    <div
      ref={gameAreaRef}
      className="game-area"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: '#0F172A', 
        overflow: 'hidden',
        position: 'relative',
        cursor: (gameState === GameState.Playing) ? 'pointer' : 'default',
      }}
      onClick={gameState === GameState.Playing ? handleJump : undefined}
      role="application"
      aria-label="Santa's Bag Run game area"
    >
      {staticStars.map((star, index) => (
        <div key={`star-${index}`} style={{
          position: 'absolute',
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          backgroundColor: star.color,
          borderRadius: '50%',
          opacity: 0.8,
          zIndex: 0,
        }} />
      ))}

      {shootingStars.map(ss => (
        <div key={ss.id} style={{
          position: 'absolute',
          left: ss.x,
          top: ss.y,
          width: '2px', 
          height: ss.length,
          backgroundColor: SHOOTING_STAR_COLOR,
          opacity: ss.opacity,
          transform: `rotate(${ss.angle - 90}deg)`, 
          transformOrigin: 'top left',
          zIndex: 0,
          borderRadius: '1px',
          boxShadow: `0 0 5px ${SHOOTING_STAR_COLOR}`,
        }} />
      ))}
      
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: GROUND_LEVEL_THICKNESS,
        zIndex: 1,
        backgroundColor: GRASS_COLOR,
      }} />

      <div style={playerStyle}>
        {renderSantaCharacter()}
      </div>

      {obstacles.map(renderBuildingObstacle)}

      {powerUps.map(renderCollectibleItem)}

    </div>
  );
}
