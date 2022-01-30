import { EntityRepository, Repository } from 'typeorm';
import { CreateFitnessLocationDto } from '@/dtos/fitness-locations.dto';
import { FitnessLocationEntity } from '@entities/fitness-location.entity';
import { HttpException } from '@exceptions/HttpException';
import { FitnessLocation } from '@interfaces/fitness-location.interface';
import { isEmpty } from '@utils/util';
import { User } from '@/interfaces/users.interface';

@EntityRepository()
class FitnessLocationService extends Repository<FitnessLocationEntity> {
  public async findAllFitnessLocation(): Promise<FitnessLocation[]> {
    const fitnessLocations: FitnessLocation[] = await FitnessLocationEntity.find();
    return fitnessLocations;
  }

  public async findFitnessLocationsByUserId(userId: number): Promise<FitnessLocation[]> {
    const fitnessLocations: FitnessLocation[] = await FitnessLocationEntity.find({ where: { userId: userId } });
    return fitnessLocations;
  }

  public async findFitnessLocationsByIsVerified(isVerified?: boolean): Promise<FitnessLocation[]> {
    const fitnessLocations: FitnessLocation[] = await FitnessLocationEntity.find({ where: { isVerified: isVerified } });
    return fitnessLocations;
  }

  public async createFitnessLocation(user: User, fitnessLocationData: CreateFitnessLocationDto): Promise<FitnessLocation> {
    if (isEmpty(fitnessLocationData)) throw new HttpException(400, 'Empty fitnessLocationData');

    const findFitnessLocation: FitnessLocation = await FitnessLocationEntity.findOne({ where: { userId: user.id } });
    if (findFitnessLocation) throw new HttpException(409, `Your fitness location with user.id ${user.id} already exists`);

    const createFitnessLocationData: FitnessLocation = await FitnessLocationEntity.create({ ...fitnessLocationData, userId: user.id }).save();
    return createFitnessLocationData;
  }

  public async updateFitnessLocation(fitnessLocation: FitnessLocation, fitnessLocationData: CreateFitnessLocationDto) {
    if (isEmpty(fitnessLocationData)) throw new HttpException(400, 'Empty fitnessLocationData');

    await FitnessLocationEntity.update(fitnessLocation.id, { ...fitnessLocationData });

    const updateFitnessLocation: FitnessLocation = await FitnessLocationEntity.findOne({ where: { id: fitnessLocation.id } });
    return updateFitnessLocation;
  }
}

export default FitnessLocationService;
