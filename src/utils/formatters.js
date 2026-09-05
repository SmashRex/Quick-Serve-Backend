export function formatAddress(row) {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    lat: Number(row.lat),
    lng: Number(row.lng),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parsePickupWindow(raw) {
  if (!raw) return { scheduledPickupStart: null, scheduledPickupEnd: null };
  const inner = raw.slice(1, -1); // strip leading [ and trailing )
  const [startRaw, endRaw] = inner.split(',').map((s) => s.replace(/^"|"$/g, ''));
  return {
    scheduledPickupStart: new Date(startRaw).toISOString(),
    scheduledPickupEnd: new Date(endRaw).toISOString(),
  };
}

export function formatOrder(row, items) {
  const { scheduledPickupStart, scheduledPickupEnd } = parsePickupWindow(row.scheduled_pickup_window);
  const base = {
    id: row.id,
    customerId: row.customer_id,
    partnerId: row.partner_id,
    pickupAddressId: row.pickup_address_id,
    deliveryAddressId: row.delivery_address_id,
    currentStatus: row.current_status,
    serviceType: row.service_type,
    price: row.price,
    paymentStatus: row.payment_status,
    scheduledPickupStart,
    scheduledPickupEnd,
    acceptedAt: row.accepted_at,
    slaDeadline: row.sla_deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (items) base.items = items.map(formatOrderItem);
  return base;
}

export function formatOrderItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    description: row.description,
    quantity: row.quantity,
    itemPrice: row.item_price,
    pickupPhotoUrl: row.pickup_photo_url,
    deliveryPhotoUrl: row.delivery_photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatHistoryEntry(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedByType: row.changed_by_type,
    changedById: row.changed_by_id,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function formatPayment(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: row.amount,
    provider: row.provider,
    providerRef: row.provider_ref,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatRider(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatPartner(row) {
  return {
    id: row.id,
    businessName: row.business_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    maxTurnaroundHours: row.max_turnaround_hours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    isVerified: !!row.email_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}