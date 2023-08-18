import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleGame } from './entities/article-game.entity';
import { plainToInstance } from 'class-transformer';
import { ArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article) private articlesRepository: Repository<Article>,
    @InjectRepository(ArticleGame)
    private articleGameRepository: Repository<ArticleGame>,
  ) {}

  async findAll(): Promise<ArticleDto[]> {
    const retrievedArticles = await this.articlesRepository.find();
    return plainToInstance(ArticleDto, retrievedArticles, {
      excludeExtraneousValues: true,
    });
  }

  async findByGame(id: number) {
    const articleGame = await this.articleGameRepository.findOne({
      where: {
        game_id: id,
      },
    });

    if (articleGame)
      return this.articlesRepository.findOne(articleGame.article_id);
    else return new Article();
  }
}
