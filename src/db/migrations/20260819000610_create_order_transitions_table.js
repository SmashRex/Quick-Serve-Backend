export async function up(knex) {
  await knex.schema.createTable('order_transitions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('from_status').notNullable();
    table.string('to_status').notNullable();
    table.string('allowed_actor').notNullable();
    table.timestamps(true, true);

    table.unique(['from_status', 'to_status']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('order_transitions');
}