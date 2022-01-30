import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public uuid: string;

  @IsString()
  public expoPushToken: string;
}
