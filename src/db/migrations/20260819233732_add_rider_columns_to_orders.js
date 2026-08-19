export async function up(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.uuid('pickup_rider_id').nullable()
      .references('id').inTable('riders').onDelete('SET NULL');
    table.uuid('delivery_rider_id').nullable()
      .references('id').inTable('riders').onDelete('SET NULL');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('pickup_rider_id');
    table.dropColumn('delivery_rider_id');
  });
}