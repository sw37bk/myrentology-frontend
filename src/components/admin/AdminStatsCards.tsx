import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  DollarOutlined, 
  CrownOutlined,
  TeamOutlined
} from '@ant-design/icons';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_bookings: number;
  total_revenue: number;
  new_users_today: number;
  active_subscriptions: number;
  users_trend: number;
  revenue_trend: number;
}

interface AdminStatsCardsProps {
  stats: AdminStats;
  loading?: boolean;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendColor = (trend: number) => trend >= 0 ? 'green' : 'red';

  // Значения по умолчанию если stats undefined
  const safeStats = stats || {
    total_users: 0,
    active_users: 0,
    total_bookings: 0,
    total_revenue: 0,
    new_users_today: 0,
    active_subscriptions: 0,
    users_trend: 0,
    revenue_trend: 0,
  };

  const cards = [
    {
      title: 'Всего пользователей',
      value: safeStats.total_users,
      icon: <TeamOutlined />,
      suffix: <Tag color={getTrendColor(safeStats.users_trend)}>↑ {safeStats.users_trend}%</Tag>,
    },
    {
      title: 'Активные подписки',
      value: safeStats.active_subscriptions,
      icon: <CrownOutlined />,
      suffix: null,
    },
    {
      title: 'Бронирования',
      value: safeStats.total_bookings,
      icon: <ShoppingOutlined />,
      suffix: null,
    },
    {
      title: 'Месячная выручка',
      value: safeStats.total_revenue,
      icon: <DollarOutlined />,
      suffix: <Tag color={getTrendColor(safeStats.revenue_trend)}>↑ {safeStats.revenue_trend}%</Tag>,
      formatter: formatCurrency,
    },
  ];

  return (
    <Row gutter={16}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card>
            <Statistic
              title={card.title}
              value={card.value}
              prefix={card.icon}
              suffix={card.suffix}
              loading={loading}
              formatter={card.formatter}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};