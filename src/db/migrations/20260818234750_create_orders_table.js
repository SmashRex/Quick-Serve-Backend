// src/db/migrations/xxxxxx_create_orders_table.js

export async function up(knex) {
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('customer_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');

    table.uuid('partner_id').nullable()
      .references('id').inTable('partners').onDelete('SET NULL');

    table.uuid('pickup_address_id').notNullable()
      .references('id').inTable('addresses').onDelete('RESTRICT');

    table.uuid('delivery_address_id').notNullable()
      .references('id').inTable('addresses').onDelete('RESTRICT');

    table.string('current_status').notNullable().defaultTo('order_placed');
    table.string('service_type').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.string('payment_status').notNullable().defaultTo('pending');

    table.specificType('scheduled_pickup_window', 'tstzrange').notNullable();

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('orders');
}