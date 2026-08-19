export async function up(knex) {
  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('order_id').notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');

    table.string('description').notNullable();
    table.integer('quantity').notNullable();
    table.decimal('item_price', 10, 2).notNullable();

    table.string('pickup_photo_url').nullable();
    table.string('delivery_photo_url').nullable();

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('order_items');
}
