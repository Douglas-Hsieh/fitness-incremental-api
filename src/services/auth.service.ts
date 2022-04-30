import { compare, hash } from 'bcrypt';
import config from 'config';
import { sign } from 'jsonwebtoken';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { verify as verifyGoogleUser } from '@/auth/google-auth';
import { verify as verifyAppleUser } from '@/auth/apple-auth';

@EntityRepository()
class AuthService extends Repository<UserEntity> {
  // public async signup(userData: CreateUserDto): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

  //   const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
  //   if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

  //   const hashedPassword = await hash(userData.password, 10);
  //   const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword }).save();
  //   return createUserData;
  // }

  // public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
  //   if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

  //   const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
  //   if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

  //   const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
  //   if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

  //   const tokenData = this.createToken(findUser);
  //   const cookie = this.createCookie(tokenData);

  //   return { cookie, findUser };
  // }

  public async login(idToken: string, os: string): Promise<{ cookie: string; findUser: User }> {
    if (isEmpty(idToken)) throw new HttpException(400, 'Empty idToken');

    let sub: string;
    if (os === 'android') {
      sub = (await verifyGoogleUser(idToken)).sub;
    } else if (os === 'ios') {
      sub = (await verifyAppleUser(idToken)).sub;
    } else {
      throw Error('User cannot login because they are not using android or ios');
    }

    const findUser: User = await UserEntity.findOne({ where: { uuid: sub } });
    if (!findUser) throw new HttpException(409, `uuid ${sub} not found`);

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser };
  }

  public async logout(uuid: string): Promise<User> {
    if (isEmpty(uuid)) throw new HttpException(400, 'Empty uuid');

    const findUser: User = await UserEntity.findOne({ where: { uuid: uuid } });
    if (!findUser) throw new HttpException(409, `User with uuid: ${uuid} not found`);

    return findUser;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = config.get('secretKey');
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
