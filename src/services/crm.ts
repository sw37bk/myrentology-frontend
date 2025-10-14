import { Customer, CustomerNote, LoyaltyTransaction, CustomerStats } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let customers: Customer[] = [
  {
    id: 1,
    name: 'Иван Иванов',
    phone: '+79991234567',
    email: 'ivan@example.com',
    source: 'avito',
    total_bookings: 5,
    total_spent: 25000,
    loyalty_points: 500,
    last_booking_date: '2024-06-10T00:00:00Z',
    first_booking_date: '2024-01-15T00:00:00Z',
    notes: 'Постоянный клиент, предпочитает премиум автомобили',
    tags: ['постоянный', 'надежный'],
    status: 'vip',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-10T00:00:00Z',
  },
  {
    id: 2,
    name: 'Мария Сидорова',
    phone: '+79997654321',
    email: 'maria@example.com',
    source: 'website',
    total_bookings: 2,
    total_spent: 8000,
    loyalty_points: 160,
    last_booking_date: '2024-06-08T00:00:00Z',
    first_booking_date: '2024-05-20T00:00:00Z',
    tags: ['новый'],
    status: 'active',
    created_at: '2024-05-20T00:00:00Z',
    updated_at: '2024-06-08T00:00:00Z',
  },
];

let customerNotes: CustomerNote[] = [
  {
    id: 1,
    customer_id: 1,
    author_id: 1,
    content: 'Клиент доволен обслуживанием, просил уведомлять о новых поступлениях премиум авто',
    type: 'call',
    is_important: true,
    created_at: '2024-06-05T10:30:00Z',
  },
];

let loyaltyTransactions: LoyaltyTransaction[] = [
  {
    id: 1,
    customer_id: 1,
    type: 'earn',
    points: 100,
    description: 'Начисление за аренду #1',
    booking_id: 1,
    created_at: '2024-01-15T00:00:00Z',
  },
];

export const crmApi = {
  getCustomers: async (filters?: { status?: string; search?: string }): Promise<Customer[]> => {
    await delay(400);
    let result = customers;
    
    if (filters?.status) {
      result = result.filter(c => c.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.email?.toLowerCase().includes(search)
      );
    }
    
    return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  getCustomer: async (id: number): Promise<Customer> => {
    await delay(300);
    const customer = customers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  createCustomer: async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_bookings' | 'total_spent' | 'loyalty_points'>): Promise<Customer> => {
    await delay(500);
    const newCustomer: Customer = {
      ...data,
      id: Math.max(...customers.map(c => c.id)) + 1,
      total_bookings: 0,
      total_spent: 0,
      loyalty_points: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customers.push(newCustomer);
    return newCustomer;
  },

  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    await delay(500);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    
    customers[index] = {
      ...customers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return customers[index];
  },

  getCustomerNotes: async (customerId: number): Promise<CustomerNote[]> => {
    await delay(300);
    return customerNotes
      .filter(note => note.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addCustomerNote: async (data: Omit<CustomerNote, 'id' | 'created_at'>): Promise<CustomerNote> => {
    await delay(400);
    const newNote: CustomerNote = {
      ...data,
      id: Math.max(...customerNotes.map(n => n.id), 0) + 1,
      created_at: new Date().toISOString(),
    };
    customerNotes.push(newNote);
    return newNote;
  },

  getCustomerLoyaltyTransactions: async (customerId: number): Promise<LoyaltyTransaction[]> => {
    await delay(300);
    return loyaltyTransactions
      .filter(t => t.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getCustomerStats: async (): Promise<CustomerStats> => {
    await delay(400);
    const totalCustomers = customers.length;
    const newCustomersToday = customers.filter(c => {
      const created = new Date(c.created_at);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length;
    
    const repeatCustomers = customers.filter(c => c.total_bookings > 1).length;
    const vipCustomers = customers.filter(c => c.status === 'vip').length;
    
    const averageBookings = totalCustomers > 0 
      ? customers.reduce((sum, c) => sum + c.total_bookings, 0) / totalCustomers 
      : 0;
    
    const customerRetentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    return {
      total_customers: totalCustomers,
      new_customers_today: newCustomersToday,
      repeat_customers: repeatCustomers,
      vip_customers: vipCustomers,
      average_bookings_per_customer: averageBookings,
      customer_retention_rate: customerRetentionRate,
    };
  },

  findCustomerByPhone: async (phone: string): Promise<Customer | null> => {
    await delay(200);
    return customers.find(c => c.phone === phone) || null;
  },

  updateCustomerStats: async (customerId: number, bookingAmount: number): Promise<Customer> => {
    await delay(300);
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');

    customer.total_bookings += 1;
    customer.total_spent += bookingAmount;
    customer.last_booking_date = new Date().toISOString();
    customer.updated_at = new Date().toISOString();

    const points = Math.floor(bookingAmount / 100);
    customer.loyalty_points += points;

    const newTransaction: LoyaltyTransaction = {
      id: Math.max(...loyaltyTransactions.map(t => t.id), 0) + 1,
      customer_id: customerId,
      type: 'earn',
      points: points,
      description: `Начисление за аренду на сумму ${bookingAmount} руб`,
      created_at: new Date().toISOString(),
    };
    loyaltyTransactions.push(newTransaction);

    if (customer.total_spent >= 20000 && customer.status !== 'vip') {
      customer.status = 'vip';
      customer.loyalty_points += 500;
    }

    return customer;
  },
};