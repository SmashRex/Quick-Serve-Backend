// src/db/migrations/xxxxxx_create_service_catalog_table.js

export async function up(knex) {
  await knex.schema.createTable('service_catalog', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('item_type').notNullable();
    table.string('service_type').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.unique(['item_type', 'service_type']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('service_catalog');
}