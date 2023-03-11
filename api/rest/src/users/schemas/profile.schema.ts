import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { User } from '../../users/entities/user.entity';
import { Social } from '../entities/profile.entity';

export type ProfileDocument = Profile & Document;

@Schema()
export class Profile extends CoreEntity {
  @Prop({ type: Attachment })
  avatar?: Attachment;

  @Prop()
  bio?: string;

  @Prop()
  socials?: Social[];

  @Prop()
  contact?: string;

  @Prop({ type: User })
  customer?: User;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
