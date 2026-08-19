// src/db/migrations/xxxxxx_create_addresses_table.js

export async function up(knex) {
  await knex.schema.createTable('addresses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('label');
    table.string('line1').notNullable();
    table.string('line2');
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.decimal('lat', 10, 7).notNullable();
    table.decimal('lng', 10, 7).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('addresses');
}