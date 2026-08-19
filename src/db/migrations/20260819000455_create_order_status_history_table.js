export async function up(knex) {
  await knex.schema.createTable('order_status_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');

    table.string('from_status').nullable();
    table.string('to_status').notNullable();
    table.string('changed_by_type').notNullable(); // 'customer' | 'rider' | 'partner' | 'ops' | 'system'
    table.uuid('changed_by_id').nullable();
    table.text('note').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // 🚀 Performance indexes for fast history lookups:
    table.index(['order_id']); // Faster GET /orders/:id/history queries
    table.index(['created_at']); // Faster timeline filtering in Ops dashboard
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('order_status_history');
}