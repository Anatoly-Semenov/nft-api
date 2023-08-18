import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleGame } from './entities/article-game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleGame])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
