export async function up(knex) {
  await knex.schema.alterTable('disputes', (table) => {
    table.string('status_at_dispute').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('disputes', (table) => {
    table.dropColumn('status_at_dispute');
  });
}