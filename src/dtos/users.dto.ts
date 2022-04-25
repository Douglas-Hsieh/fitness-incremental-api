import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public idToken: string;

  @IsString()
  public os: string;

  @IsEmail()
  public email?: string;

  @IsString()
  public expoPushToken?: string;
}
