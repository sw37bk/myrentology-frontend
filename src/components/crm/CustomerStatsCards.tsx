import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  TeamOutlined, 
  UserAddOutlined, 
  CrownOutlined, 
  StarOutlined,
  BarChartOutlined,
  RocketOutlined
} from '@ant-design/icons';

interface CustomerStats {
  total_customers: number;
  new_customers_today: number;
  repeat_customers: number;
  vip_customers: number;
  average_bookings_per_customer: number;
  customer_retention_rate: number;
}

interface CustomerStatsCardsProps {
  stats: CustomerStats;
  loading?: boolean;
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Всего клиентов',
      value: stats.total_customers,
      icon: <TeamOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Новых сегодня',
      value: stats.new_customers_today,
      icon: <UserAddOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Постоянных клиентов',
      value: stats.repeat_customers,
      icon: <StarOutlined />,
      color: '#fa8c16',
    },
    {
      title: 'VIP клиентов',
      value: stats.vip_customers,
      icon: <CrownOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Среднее бронирований',
      value: stats.average_bookings_per_customer,
      icon: <BarChartOutlined />,
      color: '#13c2c2',
      precision: 1,
    },
    {
      title: 'Удержание клиентов',
      value: stats.customer_retention_rate,
      icon: <RocketOutlined />,
      color: '#eb2f96',
      suffix: '%',
    },
  ];

  return (
    <Row gutter={16}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={8} xl={4} key={index}>
          <Card>
            <Statistic
              title={card.title}
              value={card.value}
              prefix={card.icon}
              loading={loading}
              precision={card.precision}
              suffix={card.suffix}
              valueStyle={{ color: card.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};