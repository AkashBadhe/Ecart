import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Author, AuthorSchema } from './schemas/authors.schemas';
import { AuthorsService } from './authors.service';
import { AuthorsController, TopAuthors } from './authors.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Author.name, schema: AuthorSchema }]),
  ],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
