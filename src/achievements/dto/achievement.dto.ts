import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { GameDto } from 'src/games/dto/game.dto';
import { AchievementRuleHandler } from '../enums/achievement-rule-handler';
import { AchievementRuleOperand } from '../enums/achievement-rule-operand.enum';
import { AchievementStatus } from '../enums/achievement-status';
export class AchievementRuleDto {
  @ApiProperty()
  @Type(() => String)
  key: string;

  @ApiProperty()
  @Type(() => String)
  operand: AchievementRuleOperand;

  @ApiProperty()
  @Type(() => String)
  value: string;

  @ApiProperty()
  @Type(() => String)
  handler: AchievementRuleHandler;
}

export class AchievementDto {
  @ApiProperty()
  @Type(() => Number)
  id: number;

  @ApiProperty()
  @Type(() => String)
  name: string;

  @ApiProperty()
  @Type(() => String)
  description: string;

  @ApiProperty()
  @Type(() => String)
  image: string;

  @ApiProperty()
  @Type(() => String)
  chain: string;

  @ApiProperty()
  @Type(() => AchievementRuleDto)
  @IsArray()
  rules: AchievementRuleDto[];

  @ApiProperty()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty()
  @Type(() => Date)
  updatedAt: Date;

  @ApiPropertyOptional()
  @Type(() => GameDto)
  game?: GameDto;

  @ApiPropertyOptional()
  @Type(() => String)
  status?: AchievementStatus;

  @ApiProperty()
  @Type(() => Number)
  scores: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  usersEarned?: number;

  constructor(partial?: Partial<AchievementDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
