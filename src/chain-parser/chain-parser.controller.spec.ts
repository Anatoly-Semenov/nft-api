import { Test, TestingModule } from '@nestjs/testing';
import { ChainParserController } from './chain-parser.controller';
import { ChainParserService } from './chain-parser.service';

describe('ChainParserController', () => {
  let controller: ChainParserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainParserController],
      providers: [ChainParserService],
    }).compile();

    controller = module.get<ChainParserController>(ChainParserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
