import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class changeMonthlyReturnTokenGameInfoAggregated1652691164876
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'game_info_aggregated',
      'monthly_return_token',
      new TableColumn({
        name: 'monthly_return_token',
        type: 'float(2)',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'game_info_aggregated',
      'monthly_return_token',
      new TableColumn({
        name: 'monthly_return_token',
        type: 'integer',
        isNullable: true,
      }),
    );
  }
}
