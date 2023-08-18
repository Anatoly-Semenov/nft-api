import { PartialType } from '@nestjs/swagger';
import { CreateAirdropDto } from './create-airdrop.dto';

export class UpdateAirdropDto extends PartialType(CreateAirdropDto) {}
