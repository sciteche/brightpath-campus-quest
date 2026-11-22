import { CAMPUS_BUILDINGS } from "../content";

export const CAMPUS_WALK_LIMIT = 8.55;
export const PLAYER_RADIUS = 0.28;
export const PLAYER_SPEED = 3.8;
export const INTERACTION_RADIUS = 0.84;
export const AUTO_WALK_ARRIVAL_RADIUS = 0.5;
const MAX_STEP = 0.05;
const BUILDING_COLLISION_RADIUS = 1.2;

export interface Point2D {
  x: number;
  z: number;
}

export interface MoveDestination extends Point2D {
  id: string;
}

export interface MovementResult {
  position: Point2D;
  moving: boolean;
  reachedId: string | null;
}

export function canOccupy(point: Point2D) {
  if (Math.hypot(point.x, point.z) > CAMPUS_WALK_LIMIT) return false;

  return CAMPUS_BUILDINGS.every((building) => {
    const distance = Math.hypot(point.x - building.x, point.z - building.z);
    return distance >= BUILDING_COLLISION_RADIUS + PLAYER_RADIUS;
  });
}

export function moveCampusPlayer(
  position: Point2D,
  input: Point2D,
  deltaSeconds: number,
  destination: MoveDestination | null = null,
): MovementResult {
  const dt = Math.min(Math.max(deltaSeconds, 0), MAX_STEP);
  const inputLength = Math.hypot(input.x, input.z);
  const useManualInput = inputLength > 0.04;

  let directionX = 0;
  let directionZ = 0;
  let activeDestination = destination;

  if (useManualInput) {
    directionX = input.x / Math.max(1, inputLength);
    directionZ = input.z / Math.max(1, inputLength);
    activeDestination = null;
  } else if (destination) {
    const distance = Math.hypot(destination.x - position.x, destination.z - position.z);
    if (distance <= AUTO_WALK_ARRIVAL_RADIUS) {
      return { position, moving: false, reachedId: destination.id };
    }
    directionX = (destination.x - position.x) / distance;
    directionZ = (destination.z - position.z) / distance;
  } else {
    return { position, moving: false, reachedId: null };
  }

  const travel = PLAYER_SPEED * dt;
  let next = { x: position.x + directionX * travel, z: position.z + directionZ * travel };
  if (!canOccupy(next)) {
    const xOnly = { x: next.x, z: position.z };
    const zOnly = { x: position.x, z: next.z };
    const canMoveX = canOccupy(xOnly);
    const canMoveZ = canOccupy(zOnly);

    if (canMoveX && canMoveZ) {
      const xProgress = Math.abs(directionX);
      const zProgress = Math.abs(directionZ);
      next = xProgress >= zProgress ? xOnly : zOnly;
    } else if (canMoveX) {
      next = xOnly;
    } else if (canMoveZ) {
      next = zOnly;
    } else {
      next = position;
    }
  }

  const stillMoving = Math.hypot(next.x - position.x, next.z - position.z) > 0.0001;
  const reachedId = activeDestination &&
    Math.hypot(activeDestination.x - next.x, activeDestination.z - next.z) <= AUTO_WALK_ARRIVAL_RADIUS
    ? activeDestination.id
    : null;

  return { position: next, moving: stillMoving, reachedId };
}