import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class addGameInfoAggregatedTable1651724156480
  implements MigrationInterface
{
  private readonly gameInfoAggregatedTable = 'game_info_aggregated';

  private readonly gameInfoAggregatedConstraintGameId =
    'unique_game_info_aggregated_game_id';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.gameInfoAggregatedTable,
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'game_id',
            type: 'integer',
            isUnique: true,
          },
          {
            name: 'monthly_return_token',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'monthly_return_usd',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'floor_price',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'players_count',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      this.gameInfoAggregatedTable,
      new TableIndex({
        name: this.gameInfoAggregatedConstraintGameId,
        columnNames: ['game_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      this.gameInfoAggregatedTable,
      this.gameInfoAggregatedConstraintGameId,
    );

    await queryRunner.dropTable(this.gameInfoAggregatedTable);
  }
}
