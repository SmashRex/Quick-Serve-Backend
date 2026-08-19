export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('phone').nullable().alter();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('phone').notNullable().alter();
  });
}