import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Input, 
  Select, 
  Button, 
  Space,
  Row,
  Col,
  Modal,
  Form,
  message
} from 'antd';
import { 
  TeamOutlined, 
  BarChartOutlined, 
  CrownOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../services/crm';
import { CustomerStatsCards } from '../components/crm/CustomerStatsCards';
import { CustomersTable } from '../components/crm/CustomersTable';

const { Option } = Select;

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

export const CRMPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: crmApi.getCustomerStats,
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => crmApi.getCustomers(filters),
  });

  const createCustomerMutation = useMutation({
    mutationFn: crmApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      setIsModalOpen(false);
      form.resetFields();
      message.success('Клиент создан успешно');
    },
  });

  const handleCreateCustomer = (values: any) => {
    createCustomerMutation.mutate({
      ...values,
      tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
    });
  };

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              CRM система - Рентология
            </h1>
            <p style={{ margin: 0, color: '#666' }}>
              Управление клиентами и программа лояльности
            </p>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Добавить клиента
          </Button>
        </div>

        <CustomerStatsCards stats={stats!} loading={statsLoading} />

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginTop: 24 }}
          items={[
            {
              key: 'customers',
              label: (
                <span>
                  <TeamOutlined />
                  Все клиенты
                </span>
              ),
              children: (
                <div>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Input
                          placeholder="Поиск по имени, телефону или email..."
                          prefix={<SearchOutlined />}
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                      </Col>
                      <Col span={6}>
                        <Select
                          placeholder="Статус клиента"
                          style={{ width: '100%' }}
                          value={filters.status || undefined}
                          onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                          allowClear
                        >
                          <Option value="active">Активные</Option>
                          <Option value="inactive">Неактивные</Option>
                          <Option value="vip">VIP</Option>
                        </Select>
                      </Col>
                      <Col span={4}>
                        <Button 
                          icon={<FilterOutlined />}
                          onClick={() => setFilters({ status: '', search: '' })}
                        >
                          Сбросить
                        </Button>
                      </Col>
                    </Row>
                  </Card>

                  <CustomersTable 
                    customers={customers}
                    loading={customersLoading}
                  />
                </div>
              ),
            },
            {
              key: 'loyalty',
              label: (
                <span>
                  <CrownOutlined />
                  Программа лояльности
                </span>
              ),
              children: (
                <Card title="Программа лояльности">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="Правила начисления" size="small">
                        <p>💎 100 баллов за каждую аренду</p>
                        <p>👑 500 баллов за статус VIP</p>
                        <p>🎁 1 балл = 1 рубль скидки</p>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="Статистика программы" size="small">
                        <p>📊 Всего начислено баллов: 15,240</p>
                        <p>💰 Использовано баллов: 8,750</p>
                        <p>👥 Участников программы: {stats?.total_customers}</p>
                      </Card>
                    </Col>
                  </Row>
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
                <Card title="Аналитика клиентской базы">
                  <p>Здесь будут графики и аналитика по клиентам...</p>
                </Card>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Добавить нового клиента"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCustomer}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Имя клиента"
                rules={[{ required: true, message: 'Введите имя клиента' }]}
              >
                <Input placeholder="Иван Иванов" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Телефон"
                rules={[{ required: true, message: 'Введите телефон' }]}
              >
                <Input placeholder="+79991234567" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input placeholder="client@example.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source"
                label="Источник"
                initialValue="other"
              >
                <Select>
                  <Option value="avito">Авито</Option>
                  <Option value="website">Сайт</Option>
                  <Option value="recommendation">Рекомендация</Option>
                  <Option value="other">Другое</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Статус"
                initialValue="active"
              >
                <Select>
                  <Option value="active">Активный</Option>
                  <Option value="inactive">Неактивный</Option>
                  <Option value="vip">VIP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Заметки"
          >
            <Input.TextArea rows={3} placeholder="Дополнительная информация о клиенте..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createCustomerMutation.isPending}
              >
                Создать клиента
              </Button>
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};