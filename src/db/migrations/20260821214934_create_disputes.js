export async function up(knex) {
  await knex.schema.createTable('disputes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');
    table.string('raised_by_type').notNullable(); // customer | rider | partner
    table.uuid('raised_by_id').notNullable();
    table.text('reason').notNullable();
    table.string('status').notNullable().defaultTo('open');
    table.text('resolution_note').nullable();
    table.uuid('resolved_by_admin_id').nullable()
      .references('id').inTable('admin_users').onDelete('SET NULL');
    table.timestamp('resolved_at').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('disputes');
}