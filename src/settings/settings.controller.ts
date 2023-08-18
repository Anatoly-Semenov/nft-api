import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/users/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.emun';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';

@Controller('settings')
@ApiBearerAuth()
@ApiTags('Settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role(UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(): Promise<Setting[]> {
    return this.settingsService.getList();
  }

  @Post()
  addSetting(@Body() createSettingDto: CreateSettingDto): Promise<Setting> {
    return this.settingsService.create(createSettingDto);
  }

  @Patch('/:id')
  updateSetting(
    @Param('id') id: number,
    updateSettingDto: UpdateSettingDto,
  ): Promise<void> {
    return this.settingsService.update(id, updateSettingDto);
  }
}
