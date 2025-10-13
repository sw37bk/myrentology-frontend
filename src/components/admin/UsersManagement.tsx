import React, { useState } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, CrownOutlined, SendOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin';

interface SystemUser {
  id: number;
  email: string;
  phone: string;
  subscription_tier: 'trial' | 'basic' | 'pro' | 'expired';
  subscription_end: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
  resource_count: number;
  booking_count: number;
  telegram_id?: string;
}

const { Option } = Select;

export const UsersManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SystemUser> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      message.success('Пользователь обновлен');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: ({ userId, message: msg }: { userId: number; message: string }) =>
      adminApi.sendTelegramNotification(userId, msg),
    onSuccess: () => {
      message.success('Уведомление отправлено');
    },
    onError: () => {
      message.error('Ошибка отправки уведомления');
    },
  });

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleSendNotification = (userId: number) => {
    Modal.confirm({
      title: 'Отправить уведомление',
      content: (
        <Input.TextArea 
          placeholder="Введите текст уведомления..."
          id="notification-text"
        />
      ),
      onOk: () => {
        const text = (document.getElementById('notification-text') as HTMLTextAreaElement)?.value;
        if (text) {
          sendNotificationMutation.mutate({ userId, message: text });
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    if (!editingUser) return;
    updateUserMutation.mutate({ id: editingUser.id, data: values });
  };

  const columns = [
    {
      title: 'Пользователь',
      dataIndex: 'email',
      key: 'email',
      render: (email: string, record: SystemUser) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{email}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
          {record.telegram_id && (
            <Tag color="blue" size="small">TG: {record.telegram_id}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Подписка',
      dataIndex: 'subscription_tier',
      key: 'subscription_tier',
      render: (tier: string, record: SystemUser) => {
        const tierConfig = {
          trial: { color: 'orange', text: 'Пробный' },
          basic: { color: 'blue', text: 'Базовый' },
          pro: { color: 'purple', text: 'PRO' },
          expired: { color: 'red', text: 'Истекла' },
        };
        
        const config = tierConfig[tier as keyof typeof tierConfig];
        
        return (
          <Space direction="vertical" size="small">
            <Tag color={config.color} icon={<CrownOutlined />}>
              {config.text}
            </Tag>
            <div style={{ fontSize: '12px' }}>
              до {new Date(record.subscription_end).toLocaleDateString('ru-RU')}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Статистика',
      key: 'stats',
      render: (_: any, record: SystemUser) => (
        <Space direction="vertical">
          <Tag>{record.resource_count} ресурсов</Tag>
          <Tag color="blue">{record.booking_count} бронирований</Tag>
        </Space>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: SystemUser) => (
        <Space direction="vertical">
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          {record.telegram_id && (
            <Button 
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSendNotification(record.id)}
            >
              Уведомление
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Редактирование: ${editingUser?.email}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Телефон"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="subscription_tier"
            label="Тип подписки"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="trial">Пробный</Option>
              <Option value="basic">Базовый</Option>
              <Option value="pro">PRO</Option>
              <Option value="expired">Истекшая</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="telegram_id"
            label="Telegram ID"
          >
            <Input placeholder="123456789" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={updateUserMutation.isPending}
              >
                Сохранить
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};