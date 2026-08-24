export async function up(knex) {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('recipient_type').notNullable();
    table.uuid('recipient_id').notNullable();
    table.string('type').notNullable();
    table.text('message').notNullable();
    table.uuid('order_id').nullable()
      .references('id').inTable('orders').onDelete('SET NULL');
    table.timestamp('read_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('notifications');
}