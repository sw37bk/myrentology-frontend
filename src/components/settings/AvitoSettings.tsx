import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, message, Space, Alert } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { AvitoSettings as AvitoSettingsType } from '../../types';

interface AvitoSettingsProps {
  userId: number;
}

export const AvitoSettings: React.FC<AvitoSettingsProps> = ({ userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AvitoSettingsType | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/avito-settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        form.setFieldsValue(data);
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
        body: JSON.stringify({ ...values, user_id: userId })
      });

      if (response.ok) {
        message.success('Настройки сохранены');
        loadSettings();
      } else {
        message.error('Ошибка сохранения настроек');
      }
    } catch (error) {
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const values = form.getFieldsValue();
      const response = await fetch('/api/avito-test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: values.client_id,
          client_secret: values.client_secret
        })
      });

      if (response.ok) {
        const data = await response.json();
        message.success('Подключение успешно');
        
        // Автоматически сохраняем токен
        form.setFieldValue('access_token', data.access_token);
        await handleSave({
          ...values,
          access_token: data.access_token
        });
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Ошибка подключения к API Авито');
      }
    } catch (error) {
      message.error('Ошибка тестирования подключения');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card 
      title={<><ApiOutlined /> Настройки API Авито</>}
      extra={
        settings?.is_connected ? (
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span style={{ color: '#52c41a' }}>Подключено</span>
          </Space>
        ) : (
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span style={{ color: '#faad14' }}>Не подключено</span>
          </Space>
        )
      }
    >
      <Alert
        message="Настройки API Авито"
        description="Эти настройки будут использоваться для всех функций: объявления, переписки, аналитика. Получите Client ID и Client Secret в личном кабинете Авито API."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={settings || {}}
      >
        <Form.Item
          name="client_id"
          label="Client ID"
          rules={[{ required: true, message: 'Введите Client ID' }]}
        >
          <Input placeholder="Введите Client ID из личного кабинета Авито" />
        </Form.Item>

        <Form.Item
          name="client_secret"
          label="Client Secret"
          rules={[{ required: true, message: 'Введите Client Secret' }]}
        >
          <Input.Password placeholder="Введите Client Secret из личного кабинета Авито" />
        </Form.Item>

        <Form.Item
          name="access_token"
          label="Access Token"
          help="Токен доступа (получается автоматически при авторизации)"
        >
          <Input.Password placeholder="Access Token" disabled />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить настройки
            </Button>
            <Button onClick={testConnection} loading={testingConnection}>
              Тестировать подключение
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {settings?.last_sync && (
        <Alert
          message={`Последняя синхронизация: ${new Date(settings.last_sync).toLocaleString()}`}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};