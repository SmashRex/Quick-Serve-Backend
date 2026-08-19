export async function up(knex) {
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('order_id').notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');

    table.decimal('amount', 10, 2).notNullable();
    table.string('provider').notNullable().defaultTo('paystack');
    table.string('provider_ref').nullable();
    table.string('status').notNullable().defaultTo('pending');

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('payments');
}