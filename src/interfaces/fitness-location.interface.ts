export interface FitnessLocation {
  id: number;
  userId: string;
  imageUri: string;
  coordinates: number[];
  isVerified: boolean | null;
}
