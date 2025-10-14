import React from 'react';
import { Card, Table, Progress, Statistic, Row, Col, Tag } from 'antd';
import { EyeOutlined, MessageOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { avitoAnalyticsApi } from '../../services/avitoAnalytics';
import { ResourceFunnel } from '../../types';

export const FunnelAnalytics: React.FC = () => {
  const { data: funnels = [], isLoading } = useQuery({
    queryKey: ['resources-funnel'],
    queryFn: avitoAnalyticsApi.getResourcesFunnel,
  });

  const columns = [
    {
      title: 'Ресурс',
      dataIndex: 'resource_name',
      key: 'resource_name',
      render: (name: string, record: ResourceFunnel) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          {record.avito_item_id && (
            <Tag size="small" color="blue">ID: {record.avito_item_id}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Просмотры',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => (
        <Statistic
          value={views}
          prefix={<EyeOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Сообщения',
      dataIndex: 'messages',
      key: 'messages',
      render: (messages: number) => (
        <Statistic
          value={messages}
          prefix={<MessageOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Бронирования',
      dataIndex: 'bookings',
      key: 'bookings',
      render: (bookings: number) => (
        <Statistic
          value={bookings}
          prefix={<CalendarOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Конверсия',
      key: 'conversion',
      render: (_: any, record: ResourceFunnel) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>Просмотры → Сообщения</span>
            <Progress 
              percent={record.conversion_views_to_messages} 
              size="small"
              format={(percent) => `${percent}%`}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>Сообщения → Бронирования</span>
            <Progress 
              percent={record.conversion_messages_to_bookings} 
              size="small"
              strokeColor="#52c41a"
              format={(percent) => `${percent}%`}
            />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 'bold' }}>Общая конверсия: {record.total_conversion}%</span>
          </div>
        </div>
      ),
    },
  ];

  const totalStats = funnels.reduce((acc, funnel) => ({
    views: acc.views + funnel.views,
    messages: acc.messages + funnel.messages,
    bookings: acc.bookings + funnel.bookings,
  }), { views: 0, messages: 0, bookings: 0 });

  const avgConversion = funnels.length > 0 
    ? funnels.reduce((acc, f) => acc + f.total_conversion, 0) / funnels.length 
    : 0;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего просмотров"
              value={totalStats.views}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего сообщений"
              value={totalStats.messages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего бронирований"
              value={totalStats.bookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Средняя конверсия"
              value={avgConversion}
              suffix="%"
              prefix={<TrophyOutlined />}
              precision={1}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Воронка по ресурсам">
        <Table
          columns={columns}
          dataSource={funnels}
          rowKey="resource_id"
          loading={isLoading}
          pagination={false}
        />
      </Card>
    </div>
  );
};