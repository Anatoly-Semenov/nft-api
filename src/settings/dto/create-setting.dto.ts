import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SettingsKey } from '../enums/settings-key.enum';

export class CreateSettingDto {
  @ApiProperty({ enum: SettingsKey })
  @IsEnum(SettingsKey, { each: true })
  readonly key: SettingsKey;

  @ApiProperty()
  @IsNotEmpty()
  readonly value: string;
}
