import { SavedGameEntity } from '@/entities/saved-games.entity';
import { UserEntity } from '@/entities/users.entity';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@/interfaces/users.interface';
import { EntityRepository, Repository } from 'typeorm';
import { verify as verifyGoogleUser } from '@/auth/google-auth';
import { verify as verifyAppleUser } from '@/auth/apple-auth';

@EntityRepository()
class SavedGameService extends Repository<SavedGameEntity> {
  public async upsertSavedGame(idToken: string, os: string, gameStateSerialized: string) {
    let sub: string;
    if (os === 'android') {
      const payload = await verifyGoogleUser(idToken);
      sub = payload.sub;
    } else if (os === 'ios') {
      const payload = await verifyAppleUser(idToken);
      sub = payload.sub;
    } else {
      throw Error('Cannot upsert saved game because they are not using android or ios');
    }

    const findUser: User = await UserEntity.findOne({ where: { sub: sub } });
    if (!findUser) throw new HttpException(404, `Could not find user`);

    await SavedGameEntity.upsert(
      {
        userId: findUser.id,
        gameStateSerialized: gameStateSerialized,
      },
      ['userId'],
    );

    const upsertSavedGame = await SavedGameEntity.findOne({ where: { userId: findUser.id } });
    return upsertSavedGame;
  }
}

export default SavedGameService;
