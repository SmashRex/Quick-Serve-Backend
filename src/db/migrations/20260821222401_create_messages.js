export async function up(knex) {
  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');
    table.string('thread_type').notNullable(); // customer_thread | partner_thread
    table.string('sender_type').notNullable(); // customer | partner | admin
    table.uuid('sender_id').notNullable();
    table.text('body').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('messages');
}