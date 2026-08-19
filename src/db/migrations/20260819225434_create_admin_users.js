export async function up(knex) {
  await knex.schema.createTable('admin_users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('full_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('role_tier').notNullable(); // dispatcher | support | finance | super_admin
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('admin_users');
}