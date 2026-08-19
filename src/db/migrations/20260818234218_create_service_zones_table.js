// src/db/migrations/xxxxxx_create_service_zones_table.js

export async function up(knex) {
  await knex.schema.createTable('service_zones', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.jsonb('polygon').notNullable(); // array of {lat, lng} points
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('service_zones');
}