export type RawTransaction = {
  tx_hash: string;
  block_number: number;
  timestamp: Date;
  address_from: string;
  address_to: string;
  value: string;
  input: string;
  game_id: number;
  grab_internal: boolean;
};
