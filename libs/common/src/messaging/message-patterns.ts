// Message patterns for inter-service communication
export const MESSAGE_PATTERNS = {
  // Auth Service Patterns
  AUTH: {
    VALIDATE_TOKEN: 'auth.validate_token',
    CREATE_USER: 'auth.create_user',
    LOGIN: 'auth.login',
  },

  // Restaurant Service Patterns
  RESTAURANT: {
    CREATE_ORDER: 'restaurant.create_order',
    UPDATE_ORDER_STATUS: 'restaurant.update_order_status',
    GET_MENU_ITEMS: 'restaurant.get_menu_items',
    CREATE_MENU_ITEM: 'restaurant.create_menu_item',
  },

  // Notification Patterns
  NOTIFICATION: {
    SEND_EMAIL: 'notification.send_email',
    SEND_SMS: 'notification.send_sms',
    ORDER_CONFIRMATION: 'notification.order_confirmation',
    ORDER_STATUS_UPDATE: 'notification.order_status_update',
  },

  // Payment Patterns
  PAYMENT: {
    PROCESS_PAYMENT: 'payment.process_payment',
    REFUND_PAYMENT: 'payment.refund_payment',
    PAYMENT_WEBHOOK: 'payment.webhook',
  },
} as const;

// Queue names
export const QUEUES = {
  AUTH: 'auth_queue',
  RESTAURANT: 'restaurant_queue',
  NOTIFICATION: 'notification_queue',
  PAYMENT: 'payment_queue',
} as const;
