import React from 'react';
import { Card, Form, Input, InputNumber, Button, Alert, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/admin';

interface SystemSettings {
  site_name: string;
  support_email: string;
  support_phone: string;
  trial_period_days: number;
  basic_price: number;
  pro_price: number;
  telegram_bot_token?: string;
}

export const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: adminApi.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => adminApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <Alert
        message="Настройки системы"
        description="Изменения влияют на всю систему и всех пользователей."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={settings}
        disabled={isLoading}
      >
        <Card title="Основные настройки" style={{ marginBottom: 24 }}>
          <Form.Item
            name="site_name"
            label="Название сайта"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="support_email"
            label="Email поддержки"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="support_phone"
            label="Телефон поддержки"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Card>

        <Card title="Настройки подписок" style={{ marginBottom: 24 }}>
          <Form.Item
            name="trial_period_days"
            label="Пробный период (дни)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="basic_price"
            label="Цена базового тарифа (руб/мес)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="pro_price"
            label="Цена PRO тарифа (руб/мес)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        <Card title="Telegram Bot" style={{ marginBottom: 24 }}>
          <Form.Item
            name="telegram_bot_token"
            label="Bot Token"
          >
            <Input.Password placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
          </Form.Item>
        </Card>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={updateMutation.isPending}
              size="large"
            >
              Сохранить настройки
            </Button>
            <Button 
              onClick={() => form.resetFields()}
              size="large"
            >
              Сбросить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};