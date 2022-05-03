import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public idToken: string;

  @IsString()
  public serverAuthCode: string;

  @IsString()
  public os: string;

  @IsEmail()
  public email?: string;

  @IsNumber()
  public timezoneOffsetMinutes: number;

  @IsString()
  public expoPushToken?: string;
}
