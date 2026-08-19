// src/db/migrations/xxxxxx_create_partners_table.js

export async function up(knex) {
  await knex.schema.createTable('partners', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('business_name').notNullable();
    table.string('contact_phone').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamp('email_verified_at').nullable();
    table.integer('max_turnaround_hours').notNullable();
    table.string('status').notNullable().defaultTo('onboarding');
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('partners');
}