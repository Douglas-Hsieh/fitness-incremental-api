import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { acquireOAuthCredentials, verify as verifyGoogleUser } from '@/auth/google-auth';
import { verify as verifyAppleUser } from '@/auth/apple-auth';

@EntityRepository()
class UserService extends Repository<UserEntity> {
  public async findAllUser(): Promise<User[]> {
    const users: User[] = await UserEntity.find();
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  // public async createUser(userData: CreateUserDto): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

  //   const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
  //   if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

  //   const hashedPassword = await hash(userData.password, 10);
  //   const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword }).save();

  //   return createUserData;
  // }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const { idToken, serverAuthCode, os, timezoneOffsetMinutes, expoPushToken } = userData;

    let sub: string;
    let email: string;
    if (os === 'android') {
      const payload = await verifyGoogleUser(idToken);
      sub = payload.sub;
      email = payload.email;
    } else if (os === 'ios') {
      const payload = await verifyAppleUser(idToken);
      sub = payload.sub;
      email = payload.email;
    } else {
      throw Error('Cannot create user because they are not using android or ios');
    }

    const findUser: User = await UserEntity.findOne({ where: { uuid: sub } });
    if (findUser) throw new HttpException(409, `uuid ${sub} already exists`);

    const tokens = await acquireOAuthCredentials(serverAuthCode);

    const createUserData: User = await UserEntity.create({
      uuid: sub,
      os: os,
      email: email,
      timezoneOffsetMinutes: timezoneOffsetMinutes,
      expoPushToken: expoPushToken,
      oAuthCredentials: JSON.stringify(tokens),
    }).save();

    return createUserData;
  }

  // public async updateUser(userId: number, userData: CreateUserDto): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

  //   const findUser: User = await UserEntity.findOne({ where: { id: userId } });
  //   if (!findUser) throw new HttpException(409, "You're not user");

  //   const hashedPassword = await hash(userData.password, 10);
  //   await UserEntity.update(userId, { ...userData, password: hashedPassword });

  //   const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
  //   return updateUser;
  // }

  public async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData empty');

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    await UserEntity.update(userId, { ...findUser, ...userData });

    const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
    return updateUser;
  }

  public async deleteUser(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "You're not user");

    await UserEntity.delete({ id: userId });
    return findUser;
  }
}

export default UserService;
