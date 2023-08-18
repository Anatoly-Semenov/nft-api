import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AchievementRuleHandler } from '../enums/achievement-rule-handler';
import { AchievementRuleOperand } from '../enums/achievement-rule-operand.enum';
import { AchievementRule } from '../interfaces/achievement-rule.interface';

export class CreateAchievementRuleDto implements AchievementRule {
  @ApiProperty()
  readonly key: string;

  @ApiProperty()
  readonly value: string;

  @ApiPropertyOptional({
    enum: AchievementRuleOperand,
    default: AchievementRuleOperand.EQUAL,
  })
  readonly operand: AchievementRuleOperand;

  @ApiPropertyOptional({
    enum: AchievementRuleHandler,
    default: AchievementRuleHandler.UNKNOWN,
  })
  readonly handler: AchievementRuleHandler;
}
