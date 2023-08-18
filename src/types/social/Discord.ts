export type DiscordInviteResponse = {
  channel: string;
  approximate_member_count: number;
  approximate_presence_count: number;
  [k: string]: any | any[];
};

export type DiscordAggregationJobData = {
  current: number;
  total: number;
  game_id: number;
  channel_id: number;
  link: string;
};
