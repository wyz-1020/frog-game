export type GameState = 'aiming' | 'jumping' | 'entering_box' | 'success' | 'fail';

export interface Point {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'pencil' | 'stone';
}

export interface LevelConfig {
  id: number;
  name: string;
  basketPos: Point;
  obstacles: Obstacle[];
  wind: number;
}
