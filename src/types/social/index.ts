export * from './Twitter';
export * from './Discord';
export * from './Telegram';

export enum SocialProcessorList {
  DISCORD = 'social-discord-processor',
  TWITTER = 'social-twitter-processor',
  TELEGRAM = 'social-twitter-processor',
}

export enum SocialQueueList {
  AggregateDiscord = 'aggregate-discord',
  AggregateTwitter = 'aggregate-twitter',
  AggregateTelegram = 'aggregate-telegram',
}

export enum SocialCacheKeyList {
  DiscordAggregationProcessing = 'discord-aggregation-processing',
  TwitterAggregationProcessing = 'twitter-aggregation-processing',
  TelegramAggregationProcessing = 'telegram-aggregation-processing',
}
