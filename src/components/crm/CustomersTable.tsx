import React from 'react';
import { Table, Tag, Avatar, Button, Space, Tooltip } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  PhoneOutlined, 
  MailOutlined,
  CrownOutlined,
  StarOutlined 
} from '@ant-design/icons';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  source: 'avito' | 'website' | 'recommendation' | 'other';
  total_bookings: number;
  total_spent: number;
  loyalty_points: number;
  last_booking_date?: string;
  status: 'active' | 'inactive' | 'vip';
}

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  onEdit?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({ 
  customers, 
  loading, 
  onEdit,
  onView
}) => {
  const columns = [
    {
      title: 'Клиент',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Customer) => (
        <Space>
          <Avatar 
            size="small"
            style={{ 
              backgroundColor: record.status === 'vip' ? '#722ed1' : 
                             record.total_bookings > 3 ? '#1890ff' : '#52c41a'
            }}
          >
            {name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {name}
              {record.status === 'vip' && (
                <Tooltip title="VIP клиент">
                  <CrownOutlined style={{ color: '#722ed1', marginLeft: 4 }} />
                </Tooltip>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: 'Статистика',
      key: 'stats',
      render: (_: any, record: Customer) => (
        <Space direction="vertical" size="small">
          <div>
            <Tag color="blue">{record.total_bookings} аренд</Tag>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Потратил: {record.total_spent.toLocaleString('ru-RU')} ₽
          </div>
        </Space>
      ),
    },
    {
      title: 'Лояльность',
      key: 'loyalty',
      render: (_: any, record: Customer) => (
        <Space direction="vertical" size="small">
          <div>
            <Tag color="green">
              <StarOutlined /> {record.loyalty_points} баллов
            </Tag>
          </div>
          {record.total_bookings > 1 && (
            <div style={{ fontSize: '12px', color: '#52c41a' }}>
              Постоянный клиент
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Источник',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        const sourceMap: { [key: string]: { color: string; text: string } } = {
          avito: { color: 'blue', text: 'Авито' },
          website: { color: 'green', text: 'Сайт' },
          recommendation: { color: 'orange', text: 'Рекомендация' },
          other: { color: 'default', text: 'Другое' },
        };
        const config = sourceMap[source] || sourceMap.other;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: 'Активный' },
          inactive: { color: 'red', text: 'Неактивный' },
          vip: { color: 'purple', text: 'VIP' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Последняя активность',
      dataIndex: 'last_booking_date',
      key: 'last_booking_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ru-RU') : 'Нет',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Space>
          <Tooltip title="Просмотр карточки">
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>
          {record.phone && (
            <Tooltip title="Позвонить">
              <Button 
                size="small" 
                icon={<PhoneOutlined />}
                type="primary"
                href={`tel:${record.phone}`}
              />
            </Tooltip>
          )}
          {record.email && (
            <Tooltip title="Написать email">
              <Button 
                size="small" 
                icon={<MailOutlined />}
                href={`mailto:${record.email}`}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={customers}
      rowKey="id"
      loading={loading}
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => 
          `Показано ${range[0]}-${range[1]} из ${total} клиентов`
      }}
      scroll={{ x: 1000 }}
    />
  );
};