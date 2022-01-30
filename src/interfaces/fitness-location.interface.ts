export interface FitnessLocation {
  id: number;
  userId: number;
  imageUri: string;
  coordinates: number[];
  isVerified: boolean | null;
}
