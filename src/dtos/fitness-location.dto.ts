import { IsArray, IsBoolean, IsString } from 'class-validator';

export class CreateFitnessLocationDto {
  @IsString()
  public userId: string;

  @IsString()
  public imageUri: string;

  @IsArray()
  public coordinates: number[];

  @IsBoolean()
  public isVerified: boolean | null;
}
