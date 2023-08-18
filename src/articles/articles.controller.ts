import { Controller, Get, Param } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArticleDto } from './dto/article.dto';

@Controller('articles')
@ApiTags('Articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('/list')
  @ApiResponse({
    status: 200,
    description: 'List of all articles',
    type: ArticleDto,
    isArray: true,
  })
  findAll() {
    return this.articlesService.findAll();
  }

  @Get('/by-game/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a game that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Find article for game by id',
    type: ArticleDto,
  })
  findOneByGame(@Param('id') id: string) {
    return this.articlesService.findByGame(+id);
  }
}
