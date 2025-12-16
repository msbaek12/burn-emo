export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isBurning?: boolean; // For visual effect of user message burning
}

export enum IncineratorState {
  IDLE = 'IDLE',
  BURNING = 'BURNING',
  COOLING = 'COOLING', // Showing response
}