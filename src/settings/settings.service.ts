import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import { SettingsKey } from './enums/settings-key.enum';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async getList(): Promise<Setting[]> {
    const settings = await this.settingRepository.find();

    if (!settings.length) {
      return [];
    }

    return settings;
  }

  async getById(id: number): Promise<Setting> {
    const setting = await this.settingRepository.findOne({ where: { id } });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    return setting;
  }

  async getByKey(key: SettingsKey): Promise<Setting> {
    const setting = await this.settingRepository.findOne({ where: { key } });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    return setting;
  }

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    try {
      const data = this.settingRepository.create(createSettingDto);
      const setting = await this.settingRepository.save(data);

      return setting;
    } catch (error) {
      throw new BadRequestException(error.message, error.stack);
    }
  }

  async update(id: number, updateSettingDto: UpdateSettingDto): Promise<void> {
    const setting = await this.getById(id);

    try {
      await this.settingRepository.save({ ...setting, ...updateSettingDto });
    } catch (error) {
      throw new BadRequestException(error.message, error.stack);
    }
  }
}
