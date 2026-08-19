export async function up(knex) {
  await knex.schema.createTable('riders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('full_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('phone').nullable();
    table.string('status').notNullable().defaultTo('offline'); // offline | available | on_task
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('riders');
}