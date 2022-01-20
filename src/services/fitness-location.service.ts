import { EntityRepository, Repository } from 'typeorm';
import { CreateFitnessLocationDto } from '@/dtos/fitness-location.dto';
import { FitnessLocationEntity } from '@entities/fitness-location.entity';
import { HttpException } from '@exceptions/HttpException';
import { FitnessLocation } from '@interfaces/fitness-location.interface';
import { isEmpty } from '@utils/util';

@EntityRepository()
class FitnessLocationService extends Repository<FitnessLocationEntity> {
  public async findAllFitnessLocation(): Promise<FitnessLocation[]> {
    const fitnessLocations: FitnessLocation[] = await FitnessLocationEntity.find();
    return fitnessLocations;
  }

  public async findFitnessLocationByIsVerified(isVerified?: boolean): Promise<FitnessLocation[]> {
    const fitnessLocations: FitnessLocation[] = await FitnessLocationEntity.find({ where: { isVerified: isVerified } });
    return fitnessLocations;
  }

  public async findFitnessLocationByUserId(userId: string): Promise<FitnessLocation> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findFitnessLocation: FitnessLocation = await FitnessLocationEntity.findOne({ where: { userId: userId } });
    if (!findFitnessLocation) throw new HttpException(409, "You're not user");

    return findFitnessLocation;
  }

  public async createFitnessLocation(fitnessLocationData: CreateFitnessLocationDto): Promise<FitnessLocation> {
    console.log('FitnessLocationService.createFitnessLocation');

    if (isEmpty(fitnessLocationData)) throw new HttpException(400, "You're not fitnessLocationData");

    const findFitnessLocation: FitnessLocation = await FitnessLocationEntity.findOne({ where: { userId: fitnessLocationData.userId } });
    if (findFitnessLocation) throw new HttpException(409, `Your userId ${fitnessLocationData.userId} already exists`);

    console.log('fitnessLocationData', fitnessLocationData);
    const createFitnessLocationData: FitnessLocation = await FitnessLocationEntity.create({ ...fitnessLocationData }).save();

    return createFitnessLocationData;
  }

  public async upsertFitnessLocation(userId: string, fitnessLocationData: CreateFitnessLocationDto): Promise<FitnessLocation> {
    if (isEmpty(fitnessLocationData)) throw new HttpException(400, "You're not fitnessLocationData");

    const findFitnessLocation: FitnessLocation = await FitnessLocationEntity.findOne({ where: { userId: userId } });
    if (!findFitnessLocation) throw new HttpException(409, "You're not user");

    console.log('FitnessLocationService.upsertFitnessLocation');
    await FitnessLocationEntity.upsert({ ...findFitnessLocation, ...fitnessLocationData }, ['userId']);

    const updateFitnessLocation: FitnessLocation = await FitnessLocationEntity.findOne({ where: { id: findFitnessLocation.id } });
    return updateFitnessLocation;
  }
}

export default FitnessLocationService;
