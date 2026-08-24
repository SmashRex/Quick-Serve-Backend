export async function up(knex) {
  await knex.schema.createTable('device_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('owner_type').notNullable();
    table.uuid('owner_id').notNullable();
    table.string('push_token').notNullable().unique();
    table.string('platform').nullable(); // ios | android | web
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('device_tokens');
}
