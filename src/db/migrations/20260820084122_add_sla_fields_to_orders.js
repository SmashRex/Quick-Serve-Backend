export async function up(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.timestamp('accepted_at').nullable();
    table.timestamp('sla_deadline').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('accepted_at');
    table.dropColumn('sla_deadline');
  });
}