export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
}

export async function down(knex) {
  await knex.raw('DROP EXTENSION IF EXISTS pgcrypto');
}