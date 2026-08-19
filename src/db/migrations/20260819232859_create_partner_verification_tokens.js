export async function up(knex) {
  await knex.schema.createTable('partner_verification_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('partner_id').notNullable()
      .references('id').inTable('partners').onDelete('CASCADE');
    table.string('token_hash').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();
    table.timestamps(true, false);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('partner_verification_tokens');
}