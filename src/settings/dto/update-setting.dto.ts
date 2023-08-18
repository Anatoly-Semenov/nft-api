import { OmitType } from '@nestjs/swagger';
import { CreateSettingDto } from './create-setting.dto';

export class UpdateSettingDto extends OmitType(CreateSettingDto, ['key']) {}
