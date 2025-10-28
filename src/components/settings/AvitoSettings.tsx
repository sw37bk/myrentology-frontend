import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Space, message } from 'antd';
import { ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface AvitoSettingsProps {
  userId: number;
}

export const AvitoSettings: React.FC<AvitoSettingsProps> = ({ userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/avito-settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        form.setFieldsValue(data);
        setConnected(data.connected || false);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/avito-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: values.client_id,
          client_secret: values.client_secret
        })
      });

      if (response.ok) {
        message.success('Настройки сохранены');
        loadSettings();
      } else {
        const error = await response.json();
        message.error(error.error || 'Ошибка сохранения');
      }
    } catch (error) {
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    const values = form.getFieldsValue();
    if (!values.client_id || !values.client_secret) {
      message.error('Сначала сохраните ключи');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/avito-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
      });

      if (response.ok) {
        message.success('Авито подключено!');
        setConnected(true);
      } else {
        const error = await response.json();
        message.error(error.error || 'Ошибка подключения');
      }
    } catch (error) {
      message.error('Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {connected ? (
        <Alert
          message="✅ Авито подключено"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Alert
          message="❌ Авито не подключено"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        size="small"
      >
        <Form.Item
          name="client_id"
          label="Client ID"
          rules={[{ required: true, message: 'Введите Client ID' }]}
        >
          <Input placeholder="Ваш Client ID" />
        </Form.Item>

        <Form.Item
          name="client_secret"
          label="Client Secret"
          rules={[{ required: true, message: 'Введите Client Secret' }]}
        >
          <Input.Password placeholder="Ваш Client Secret" />
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            block
          >
            Сохранить ключи
          </Button>
          
          {!connected && (
            <Button 
              type="default"
              onClick={handleConnect}
              loading={loading}
              icon={<ApiOutlined />}
              block
            >
              Подключить
            </Button>
          )}
        </Space>
      </Form>
    </div>
  );
};