import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialServiceList } from '../entities/social-channel.entity';

export class AddSocialChannelDto {
  @ApiProperty()
  readonly channel: string;

  @ApiPropertyOptional({
    enum: SocialServiceList,
    default: SocialServiceList.TWITTER,
  })
  readonly service: SocialServiceList;
}
