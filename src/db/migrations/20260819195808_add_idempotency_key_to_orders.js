export async function up(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.string('idempotency_key').nullable();
  });

  // Partial unique index: only enforced when idempotency_key is actually provided
  await knex.raw(`
    CREATE UNIQUE INDEX orders_customer_idempotency_key_unique
    ON orders (customer_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL
  `);
}

export async function down(knex) {
  await knex.raw('DROP INDEX IF EXISTS orders_customer_idempotency_key_unique');
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('idempotency_key');
  });
}