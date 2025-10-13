import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Form,
  Table,
  Tag,
} from 'antd';
import { FilterOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { financeApi } from '../services/finance';
import { productsApi } from '../services/products';
import type { PeriodFilter, BookingWithRevenue } from '../types';
import { StatsCards } from '../components/finance/StatsCards';

const { RangePicker } = DatePicker;
const { Option } = Select;

export const FinancesPage: React.FC = () => {
  const [filter, setFilter] = useState<PeriodFilter>({
    start_date: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
  });
  const [form] = Form.useForm();

  const { data: resources = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getList,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-stats', filter],
    queryFn: () => financeApi.getStats(filter),
  });

  const { data: bookingsWithRevenue, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings-revenue', filter],
    queryFn: () => financeApi.getBookingsWithRevenue(filter),
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['revenue-chart', filter],
    queryFn: () => financeApi.getRevenueChartData(filter),
  });

  const handleFilter = (values: any) => {
    const newFilter: PeriodFilter = {
      start_date: values.date_range[0].format('YYYY-MM-DD'),
      end_date: values.date_range[1].format('YYYY-MM-DD'),
    };

    if (values.resource_id) {
      newFilter.resource_id = values.resource_id;
    }

    setFilter(newFilter);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: 'Ресурс',
      dataIndex: ['product', 'name'],
      key: 'resource',
    },
    {
      title: 'Клиент',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Период',
      key: 'period',
      render: (record: BookingWithRevenue) => (
        <div>
          <div>{new Date(record.start_date).toLocaleDateString('ru-RU')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.days_count} дн.
          </div>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'orange', text: 'Ожидание' },
          confirmed: { color: 'green', text: 'Подтверждено' },
          cancelled: { color: 'red', text: 'Отменено' },
          completed: { color: 'blue', text: 'Завершено' },
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: 'Выручка',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <strong style={{ color: '#1890ff' }}>
          {formatCurrency(revenue)}
        </strong>
      ),
    },
  ];

  return (
    <div>
      <Card title={<><DollarOutlined /> Финансовая аналитика</>} style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilter}
          initialValues={{
            date_range: [dayjs().subtract(30, 'days'), dayjs()],
          }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="date_range"
                label="Период"
                rules={[{ required: true, message: 'Выберите период' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="resource_id"
                label="Ресурс"
              >
                <Select placeholder="Все ресурсы" allowClear>
                  {resources.map(resource => (
                    <Option key={resource.id} value={resource.id}>
                      {resource.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={10}>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<FilterOutlined />}
                >
                  Применить
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => console.log('Экспорт...')}
                >
                  Экспорт
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {stats && (
        <div style={{ marginBottom: 24 }}>
          <StatsCards stats={stats} loading={statsLoading} />
        </div>
      )}

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Динамика выручки" loading={chartLoading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Выручка' : 'Бронирования'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Выручка"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Ключевые метрики" loading={statsLoading}>
            {stats && (
              <div>
                <p>Общая выручка: <strong>{formatCurrency(stats.total_revenue)}</strong></p>
                <p>Бронирований: <strong>{stats.total_bookings}</strong></p>
                <p>Средний чек: <strong>{formatCurrency(stats.average_check)}</strong></p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Детализация бронирований" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={bookingsWithRevenue}
          rowKey="id"
          loading={bookingsLoading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>
    </div>
  );
};