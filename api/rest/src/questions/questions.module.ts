import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schemas/questions.schema';
import { QuestionController } from './questions.controller';
import { QuestionService } from './questions.service';
import { MyQuestionsService } from './my-questions.service';
import { MyQuestionsController } from './my-questions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [QuestionController, MyQuestionsController],
  providers: [QuestionService, MyQuestionsService],
})
export class QuestionModule {}

