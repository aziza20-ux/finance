export interface Pot {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  theme: string; // Color theme
  createdAt: string;
}

export interface PotInput {
  name: string;
  targetAmount: number;
  theme: string;
  savedAmount?: number;
}
