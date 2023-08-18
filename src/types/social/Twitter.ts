import { SocialStatsDto } from 'src/socials/dto/social-stats.dto';

type TwitterUsernameInfoData = { [k in 'id' | 'name' | 'username']: string };

export type TwitterPublicMetrics = TwitterUsernameInfoData & {
  public_metrics: {
    [k in
      | 'followers_count'
      | 'following_count'
      | 'tweet_count'
      | 'listed_count']: number;
  };
};

type TwitterTweetPublicMetrics = {
  [k in 'retweet_count' | 'reply_count' | 'like_count' | 'quote_count']: number;
};

export type TwitterMetricsReturned = Pick<
  SocialStatsDto,
  'likes_count' | 'comments_count' | 'reposts_count'
>;

export type TwitterUsernameInfo = {
  data: TwitterUsernameInfoData[];
};

export type TwitterUserInfoMetrics = {
  data: TwitterPublicMetrics[];
};

export type TwitterTweetInfo = {
  twitterUserId: string;
  data: Array<
    { [k in 'id' | 'text']: string } & {
      public_metrics: TwitterTweetPublicMetrics;
    }
  >;
  meta: {
    result_count: number;
  };
};

export type TwitterAggregationJobData = {
  current: number;
  total: number;
  list: Array<{
    game_id: number;
    channel_id: number;
    username: string;
  }>;
};
