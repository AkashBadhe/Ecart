import { Module } from '@nestjs/common';
import { FeedbackController } from './feedbacks.controller';
import { FeedbackService } from './feedbacks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feedback.name, schema: FeedbackSchema }]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
