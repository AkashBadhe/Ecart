import { CoreEntity } from '../../common/entities/core.entity';

export class NewsletterSubscription extends CoreEntity {
  email: string;
  is_subscribed: boolean;
  subscribed_at?: string;
  unsubscribed_at?: string;
}
