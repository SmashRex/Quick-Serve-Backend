
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('full_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('phone').notNullable().unique();
    table.timestamp('email_verified_at').nullable();
    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}