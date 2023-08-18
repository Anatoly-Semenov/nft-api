import { PartialType } from '@nestjs/swagger';
import { AddGameAdditionalInfoDto } from './add-game-additional-info.dto';

export class UpdateGameAdditionalInfoDto extends PartialType(
  AddGameAdditionalInfoDto,
) {}
