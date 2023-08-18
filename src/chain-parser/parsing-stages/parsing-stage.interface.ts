import { ParserConfigDto } from '../dto/parser-config.dto';

export interface IParsingStage {
  run(config: ParserConfigDto);
}
