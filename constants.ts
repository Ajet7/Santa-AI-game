export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;

// Game Rules
export const GAME_DURATION_SECONDS = 60;

// Ground Constants
export const GROUND_LEVEL_THICKNESS = 60;
export const GRASS_COLOR = '#38A169'; // A nice green for grass (Tailwind green-600)

// Player (Santa Claus) Constants
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 60;
export const PLAYER_INITIAL_X = 50;
export const GROUND_SURFACE_Y = GAME_HEIGHT - GROUND_LEVEL_THICKNESS;
export const JUMP_FORCE = 11.5; // Adjusted for Dino game feel
export const GRAVITY = 0.45;  // Adjusted for Dino game feel (floatier)
export const LEG_ANIMATION_CYCLE_FRAMES = 12; // Speed of leg/arm cycle
export const ARM_SWING_ANGLE = 45; // Increased swing
export const LEG_SWING_ANGLE = 35; // Slightly increased leg swing
export const BODY_BOB_AMOUNT = 2; // Pixels for up-down body movement

// Santa Colors
export const SANTA_SUIT_COLOR = '#1D4ED8'; // Darker Blue (Tailwind Blue-700)
export const SANTA_FUR_TRIM_COLOR = '#FFFFFF';
export const SANTA_BELT_COLOR = '#222222';
export const SANTA_BELT_BUCKLE_COLOR = '#FFD700';
export const SANTA_BOOT_COLOR = '#333333';
export const SANTA_SKIN_COLOR = '#F0C4A8';
export const SANTA_BEARD_COLOR = '#F5F5F5';
export const SANTA_HAT_POMPOM_COLOR = '#FFFFFF';

// Santa's Bag Constants
export const SANTA_BAG_CAPACITY = 7; // No longer used for game logic, but kept for text consistency if needed
export const SANTA_BAG_COLOR = '#A0522D'; // Sienna - a brownish color for the bag

export const SANTA_BAG_INITIAL_WIDTH_FACTOR = 0.5;
export const SANTA_BAG_INITIAL_HEIGHT_FACTOR = 0.6;
export const SANTA_BAG_GROWTH_PER_FOLDER_WIDTH_FACTOR = 0.05; // Bag width increases by 5% of PLAYER_WIDTH per folder
export const SANTA_BAG_GROWTH_PER_FOLDER_HEIGHT_FACTOR = 0.05; // Bag height increases by 5% of PLAYER_HEIGHT per folder

export const SANTA_BAG_OFFSET_X_FACTOR = 0.25; // Positive to be on his right (viewer's right when Santa faces left)
export const SANTA_BAG_OFFSET_Y_FACTOR = 0.15;

// Constants for small folder icons on Santa's bag (still used for visual indication on the bag)
export const BAG_FOLDER_ICON_WIDTH = 10;
export const BAG_FOLDER_ICON_HEIGHT = 8;
export const BAG_FOLDER_ICON_COLOR = '#FFD700'; // Gold color for icons
export const BAG_FOLDER_ICON_SPACING = 3;

// Obstacle (Tall Building) Constants
export const BUILDING_MIN_WIDTH = 40;
export const BUILDING_MAX_WIDTH = 60;
export const BUILDING_HEIGHT = PLAYER_HEIGHT;
export const BUILDING_BODY_COLOR = '#6B7280';
export const BUILDING_ROOF_COLOR = '#4B5563';
export const BUILDING_WINDOW_COLOR = '#FBBF24';
export const BUILDING_WINDOW_OFF_COLOR = '#374151';
export const BUILDING_OUTLINE_COLOR = '#374151';

export const INITIAL_OBSTACLE_SPEED = 5.5; // Slower start for Dino game feel
export const MAX_OBSTACLE_SPEED = 14.0; // Max speed cap for Dino game feel
export const OBSTACLE_SPAWN_INTERVAL_MIN = 150; // Increased gap
export const OBSTACLE_SPAWN_INTERVAL_MAX = 250; // Increased gap

// Time-based speed increase for Dino game feel
export const TIME_BASED_SPEED_INCREASE_INTERVAL_FRAMES = 300; // Approx 5s at 60fps
export const TIME_BASED_SPEED_INCREASE_AMOUNT = 0.1;


// Power-up Constants
export const GENERIC_COLLECTIBLE_ITEM_WIDTH = 35;
export const GENERIC_COLLECTIBLE_ITEM_HEIGHT = 28;
export const GENERIC_COLLECTIBLE_ITEM_TAB_HEIGHT = 6;
export const GENERIC_COLLECTIBLE_ITEM_TAB_WIDTH_FACTOR = 0.4;
export const GENERIC_COLLECTIBLE_ITEM_OUTLINE_COLOR = '#4A5568';

export interface CollectibleFileType {
  id: string;
  label: string;
  baseColor: string;
  iconColor: string;
  tabColor?: string;
}

export const COLLECTIBLE_FILE_TYPES: CollectibleFileType[] = [
  { id: 'ppt', label: 'PPT', baseColor: '#D04424', iconColor: '#FFFFFF', tabColor: '#B0341A' },
  { id: 'excel', label: 'XLS', baseColor: '#107C41', iconColor: '#FFFFFF', tabColor: '#0C5C2F' },
  { id: 'pdf', label: 'PDF', baseColor: '#AE0F0A', iconColor: '#FFFFFF', tabColor: '#8E0C08' },
  { id: 'word', label: 'DOC', baseColor: '#2B579A', iconColor: '#FFFFFF', tabColor: '#1F3F7A' },
  { id: 'image', label: 'IMG', baseColor: '#753BBD', iconColor: '#FFFFFF', tabColor: '#5D2E9A' },
];

export const FOLDER_CAPACITY = 5; // 5 Files make up one completed Folder for VISUAL bag growth
export const SPEED_INCREMENT_PER_COLLECTIBLE = 0.05; // Smaller boost, main increase is time-based
export const COLLECTIBLE_ITEM_SPAWN_INTERVAL_MIN = 180; // In frames
export const COLLECTIBLE_ITEM_SPAWN_INTERVAL_MAX = 280; // In frames

// Static Stars Constants
export const NUM_STARS = 50;
export const STAR_MIN_SIZE = 1;
export const STAR_MAX_SIZE = 3;
export const STAR_COLORS = ['#FFFFFF', '#FFFACD', '#FFF0F5'];

// Shooting Stars Constants
export const MAX_SHOOTING_STARS = 3;
export const SHOOTING_STAR_SPAWN_INTERVAL_MIN = 100;
export const SHOOTING_STAR_SPAWN_INTERVAL_MAX = 300;
export const SHOOTING_STAR_MIN_SPEED = 3;
export const SHOOTING_STAR_MAX_SPEED = 6;
export const SHOOTING_STAR_MIN_LENGTH = 40;
export const SHOOTING_STAR_MAX_LENGTH = 80;
export const SHOOTING_STAR_COLOR = 'rgba(255, 255, 224, 0.7)';

// Game Title for High Score
export const GAME_TITLE_KEY = 'santasBagRunHighScore_v7_1min_files'; // Updated key for new mechanics
