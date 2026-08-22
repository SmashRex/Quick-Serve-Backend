export async function up(knex) {
  await knex.schema.createTable('partner_payouts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('partner_id').notNullable()
      .references('id').inTable('partners').onDelete('CASCADE');
    table.uuid('order_id').notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('status').notNullable().defaultTo('pending'); // pending | paid
    table.uuid('marked_paid_by_admin_id').nullable()
      .references('id').inTable('admin_users').onDelete('SET NULL');
    table.timestamp('paid_at').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('partner_payouts');
}