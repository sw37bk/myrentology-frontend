import React, { useState } from 'react';
import { Card, Tabs, Alert, Row, Col, Typography, Statistic, Space, List, Tag } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  SettingOutlined, 
  BarChartOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  CalendarOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../services/bookings';
import { productsApi } from '../services/products';
import { avitoApi } from '../services/avitoService';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuthStore();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getList,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getList,
  });

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: avitoApi.getChats,
  });

  // Вычисляем статистику из реальных данных
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => {
      const days = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24));
      return sum + (booking.product.price * days);
    }, 0);

  const activeProducts = products.filter(p => p.is_active).length;
  const totalBookings = bookings.length;
  const activeChats = chats.filter(c => c.status === 'active').length;

  if (user?.role !== 'admin') {
    return (
      <Card>
        <Alert
          message="Доступ запрещен"
          description="У вас недостаточно прав для доступа к этой странице."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Панель управления Рентология
        </Title>
        <Text type="secondary">
          Административная панель для управления платформой аренды
        </Text>
      </div>

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'dashboard',
              label: (
                <span>
                  <DashboardOutlined />
                  Дашборд
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Активные ресурсы"
                          value={activeProducts}
                          prefix={<UserOutlined />}
                          loading={productsLoading}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Активные чаты"
                          value={activeChats}
                          prefix={<MessageOutlined />}
                          loading={chatsLoading}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Общая выручка"
                          value={totalRevenue}
                          prefix={<DollarOutlined />}
                          suffix="₽"
                          loading={bookingsLoading}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="Всего бронирований"
                          value={totalBookings}
                          prefix={<CalendarOutlined />}
                          loading={bookingsLoading}
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col span={12}>
                      <Card title="Последние бронирования">
                        <List
                          size="small"
                          dataSource={bookings.slice(0, 5)}
                          renderItem={(booking) => (
                            <List.Item>
                              <List.Item.Meta
                                title={booking.product.name}
                                description={`${booking.customer_name} • ${new Date(booking.start_date).toLocaleDateString('ru-RU')}`}
                              />
                              <Tag color={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'orange' : 'red'}>
                                {booking.status === 'confirmed' ? 'Подтверждено' : 
                                 booking.status === 'pending' ? 'Ожидает' : 
                                 booking.status === 'cancelled' ? 'Отменено' : 'Завершено'}
                              </Tag>
                            </List.Item>
                          )}
                          loading={bookingsLoading}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="Активные чаты">
                        <List
                          size="small"
                          dataSource={chats.slice(0, 5)}
                          renderItem={(chat) => (
                            <List.Item>
                              <List.Item.Meta
                                title={chat.customer_name}
                                description={chat.last_message.substring(0, 50) + '...'}
                              />
                              <Tag color="blue">
                                {chat.unread_count} непрочитанных
                              </Tag>
                            </List.Item>
                          )}
                          loading={chatsLoading}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'users',
              label: (
                <span>
                  <TeamOutlined />
                  Пользователи
                </span>
              ),
              children: (
                <Card title="Управление пользователями">
                  <Alert
                    message="Управление пользователями"
                    description="Здесь будет список всех пользователей системы с возможностью управления их аккаунтами."
                    type="info"
                    showIcon
                  />
                </Card>
              ),
            },
            {
              key: 'analytics',
              label: (
                <span>
                  <BarChartOutlined />
                  Аналитика
                </span>
              ),
              children: (
                <Card title="Детальная аналитика">
                  <Alert
                    message="Аналитика системы"
                    description="Подробные графики и отчеты по использованию платформы."
                    type="info"
                    showIcon
                  />
                </Card>
              ),
            },
            {
              key: 'settings',
              label: (
                <span>
                  <SettingOutlined />
                  Настройки системы
                </span>
              ),
              children: (
                <Card title="Системные настройки">
                  <Alert
                    message="Настройки Рентология"
                    description="Конфигурация основных параметров платформы аренды."
                    type="info"
                    showIcon
                  />
                </Card>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};