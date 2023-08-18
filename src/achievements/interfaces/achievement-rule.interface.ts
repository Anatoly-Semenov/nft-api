import { AchievementRuleHandler } from '../enums/achievement-rule-handler';
import { AchievementRuleOperand } from '../enums/achievement-rule-operand.enum';

export interface AchievementRule {
  key: string;
  operand: AchievementRuleOperand;
  value: string;
  handler: AchievementRuleHandler;
}
