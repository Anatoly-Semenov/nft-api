import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContractService } from './services/contract.service';
import { ContractDto } from './dto/contract.dto';

@Controller('parser-contract')
@ApiTags('Chain Parser')
@ApiBearerAuth()
export class ParserContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('/game-contract')
  async gameContractList() {
    return this.contractService.getGameContractList();
  }

  @Post('/game-contract')
  saveGameContract(@Body() body: any) {
    return this.contractService.saveGameContract(body);
  }

  @Delete('/game-contract/:id')
  deleteGameContract(@Param('id') id: string) {
    return this.contractService.deleteGameContract(+id);
  }

  @Get('/token-contract')
  async tokenContractList() {
    return this.contractService.getTokenContractList();
  }

  @Post('/token-contract')
  saveTokenContract(@Body() body: any) {
    return this.contractService.saveTokenContract(body);
  }

  @Delete('/token-contract/:id')
  deleteTokenContract(@Param('id') id: string) {
    return this.contractService.deleteTokenContract(+id);
  }

  @Get('/game-wallet')
  async gameWalletList() {
    return this.contractService.getGameWalletList();
  }

  @Post('/game-wallet')
  saveGameWallet(@Body() body: ContractDto) {
    return this.contractService.saveGameWallet(body);
  }

  @Delete('/game-wallet/:id')
  deleteGameWallet(@Param('id') id: string) {
    return this.contractService.deleteGameWallet(+id);
  }
}
