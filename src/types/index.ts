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
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  discount_amount?: number;
  loyalty_points_used?: number;
  notes?: string;
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

// CRM типы
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  source: 'avito' | 'website' | 'recommendation' | 'other';
  total_bookings: number;
  total_spent: number;
  loyalty_points: number;
  last_booking_date?: string;
  first_booking_date: string;
  notes?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'vip';
  loyalty_config_id?: number;
  free_hours_balance: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  author_id: number;
  content: string;
  type: 'call' | 'meeting' | 'note' | 'email' | 'system';
  is_important: boolean;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  customer_id: number;
  type: 'earn' | 'spend' | 'expire';
  points: number;
  description: string;
  booking_id?: number;
  created_at: string;
}

export interface CustomerStats {
  total_customers: number;
  new_customers_today: number;
  repeat_customers: number;
  vip_customers: number;
  average_bookings_per_customer: number;
  customer_retention_rate: number;
}

export interface LoyaltyConfig {
  id: number;
  user_id: number;
  name: string;
  cashback_enabled: boolean;
  cashback_percentage: number;
  free_hours_enabled: boolean;
  free_hours_threshold: number;
  free_hours_amount: number;
  points_per_ruble: number;
  is_active: boolean;
  created_at: string;
}
