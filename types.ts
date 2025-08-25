import { GENERIC_COLLECTIBLE_ITEM_HEIGHT, GENERIC_COLLECTIBLE_ITEM_WIDTH } from "./constants";

export enum GameState {
  StartScreen,
  Playing,
  GameOver,
}

export type GameOverReason = 'collision' | 'time_up';

export interface PlayerState {
  y: number;
  velocityY: number;
  isJumping: boolean;
}

export interface Obstacle {
  id: number;
  x: number;
  width?: number;
  height?: number;
  hasPowerUp?: boolean;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number; 
  height: number; 
  type: 'speed_boost'; // Each collected item still gives a speed boost
  collected: boolean;
  collectibleFileType?: string; // e.g., 'ppt', 'excel', 'pdf', 'word', 'image'
}

export interface ShootingStar {
  id: number;
  x: number;
  y: number;
  length: number;
  angle: number; // in degrees
  speed: number;
  opacity: number;
  life: number; // remaining frames
}
