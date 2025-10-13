export interface User {
  id: number;
  email: string;
  phone: string;
  subscription_tier: 'trial' | 'basic' | 'pro' | 'expired';
  subscription_end: string;
  role?: 'user' | 'admin';
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  product: Product;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  title?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}



export interface Chat {
  id: number;
  avito_chat_id: string;
  item_id: string;
  item_title: string;
  customer_name: string;
  customer_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  message_id: string;
  text: string;
  is_from_customer: boolean;
  timestamp: string;
  is_read: boolean;
  direction: 'incoming' | 'outgoing';
}

export interface AvitoSettings {
  id?: number;
  user_id: number;
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  token_expires?: string;
  is_connected: boolean;
  last_sync?: string;
}

export interface AvitoWebhookPayload {
  client_id: string;
  chat_id: string;
  message: {
    text: string;
    type: 'text' | 'image' | 'file';
  };
  item: {
    id: string;
    title: string;
  };
  user: {
    name: string;
    phone: string;
  };
  timestamp: number;
}

export interface AIPrompt {
  id: number;
  user_id: number;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

export interface AutoReplySettings {
  id?: number;
  user_id: number;
  enabled: boolean;
  response_delay: number;
  working_hours_start: string;
  working_hours_end: string;
  offline_message: string;
  welcome_message: string;
  unavailable_message: string;
}

export interface FinancialStats {
  total_revenue: number;
  total_bookings: number;
  average_check: number;
  active_resources: number;
  revenue_trend: number;
  bookings_trend: number;
}

export interface BookingWithRevenue extends Booking {
  revenue: number;
  days_count: number;
}

export interface RevenueByResource {
  resource_id: number;
  resource_name: string;
  revenue: number;
  booking_count: number;
}

export interface PeriodFilter {
  start_date: string;
  end_date: string;
  resource_id?: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface SystemSettings {
  site_name: string;
  site_description: string;
  support_email: string;
  support_phone: string;
  trial_period_days: number;
  basic_price: number;
  pro_price: number;
  telegram_bot_token?: string;
  email_smtp_host?: string;
  email_smtp_port?: number;
  email_smtp_user?: string;
  email_smtp_pass?: string;
}
