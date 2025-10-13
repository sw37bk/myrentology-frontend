import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { FinancialStats } from '../../types';

interface StatsCardsProps {
  stats: FinancialStats;
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'green' : 'red';
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Общая выручка"
            value={stats.total_revenue}
            formatter={(value) => formatCurrency(Number(value))}
            loading={loading}
            suffix={
              <Tag color={getTrendColor(stats.revenue_trend)}>
                {getTrendIcon(stats.revenue_trend)}
                {Math.abs(stats.revenue_trend)}%
              </Tag>
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Бронирования"
            value={stats.total_bookings}
            loading={loading}
            suffix={
              <Tag color={getTrendColor(stats.bookings_trend)}>
                {getTrendIcon(stats.bookings_trend)}
                {Math.abs(stats.bookings_trend)}%
              </Tag>
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Средний чек"
            value={stats.average_check}
            formatter={(value) => formatCurrency(Number(value))}
            loading={loading}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Активных ресурсов"
            value={stats.active_resources}
            loading={loading}
          />
        </Card>
      </Col>
    </Row>
  );
};