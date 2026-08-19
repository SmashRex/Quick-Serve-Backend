// src/db/seeds/01_order_transitions.js

export async function seed(knex) {
  await knex('order_transitions').del(); // clear existing rows first — makes this re-runnable

  await knex('order_transitions').insert([
    { from_status: 'order_placed', to_status: 'rider_assigned', allowed_actor: 'ops/system' },
    { from_status: 'rider_assigned', to_status: 'picked_up', allowed_actor: 'rider' },
    { from_status: 'picked_up', to_status: 'at_hub', allowed_actor: 'rider' },
    { from_status: 'at_hub', to_status: 'sent_to_partner', allowed_actor: 'ops' },
    { from_status: 'sent_to_partner', to_status: 'at_partner', allowed_actor: 'partner' },
    { from_status: 'at_partner', to_status: 'cleaning_in_progress', allowed_actor: 'partner' },
    { from_status: 'cleaning_in_progress', to_status: 'ready_for_pickup', allowed_actor: 'partner' },
    { from_status: 'ready_for_pickup', to_status: 'returned_to_hub', allowed_actor: 'rider' },
    { from_status: 'returned_to_hub', to_status: 'out_for_delivery', allowed_actor: 'rider' },
    { from_status: 'out_for_delivery', to_status: 'delivered', allowed_actor: 'rider' },
  ]);
}