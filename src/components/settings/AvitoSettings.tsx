import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Alert, Space, Typography, message } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { AvitoSettings as AvitoSettingsType } from '../../types';

const { Title, Paragraph } = Typography;

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
      } else if (response.status === 404) {
        setSettings(null);
        form.resetFields();
      } else {
        console.error('Ошибка API:', response.status, response.statusText);
        setSettings(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      setSettings(null);
      form.resetFields();
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/avito-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          client_id: values.client_id,
          client_secret: values.client_secret,
          access_token: values.access_token || null,
          is_connected: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        message.success('Настройки сохранены');
        loadSettings();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const startOAuthFlow = async () => {
    const values = form.getFieldsValue();
    if (!values.client_id || !values.client_secret) {
      message.error('Введите Client ID и Client Secret');
      return;
    }

    try {
      const response = await fetch('/api/avito-oauth-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: values.client_id,
          client_secret: values.client_secret,
          user_id: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const popup = window.open(data.auth_url, 'avitoAuth', 'width=600,height=700');
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'AVITO_AUTH_SUCCESS') {
            message.success('Подключение успешно!');
            loadSettings();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'AVITO_AUTH_ERROR') {
            message.error(`Ошибка авторизации: ${event.data.error || 'Неизвестная ошибка'}`);
            window.removeEventListener('message', handleMessage);
          }
        };
        
        window.addEventListener('message', handleMessage);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Ошибка создания OAuth URL');
      }
    } catch (error) {
      console.error('OAuth start error:', error);
      message.error('Ошибка начала авторизации');
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/avito-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          client_id: '',
          client_secret: '',
          access_token: null,
          is_connected: false
        })
      });

      if (response.ok) {
        message.success('Интеграция отключена');
        form.resetFields();
        setSettings(null);
      }
    } catch (error) {
      message.error('Ошибка отключения');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card>
        <Title level={3}>Настройки интеграции с Авито</Title>
        
        <Paragraph>
          Для подключения интеграции с Авито:
        </Paragraph>

        <ol>
          <li>Получите Client ID и Client Secret в <a href="https://avito.ru/profile/messenger" target="_blank" rel="noopener noreferrer">настройках мессенджера Авито</a></li>
          <li>Введите ваши ключи ниже</li>
          <li>Мы автоматически настроим получение сообщений</li>
        </ol>

        {settings?.connected ? (
          <Alert
            message="✅ Авито успешно подключено!"
            description={
              <div>
                <div>• Client ID: {settings.client_id}</div>
                <div>• Последняя синхронизация: {settings.last_sync ? new Date(settings.last_sync).toLocaleString('ru-RU') : 'никогда'}</div>
                <div>• Статус: Активно</div>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button 
                size="small" 
                danger 
                onClick={handleDisconnect}
              >
                Отключить
              </Button>
            }
          />
        ) : settings?.has_settings && !settings?.connected ? (
          <Alert
            message="⚠️ Настройки сохранены, но не подключено"
            description="Ключи API сохранены, но нужно завершить авторизацию через Авито"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Alert
            message="❌ Авито не подключено"
            description="Введите ваши ключи API и нажмите 'Тест подключения'"
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={settings || undefined}
        >
          <Form.Item
            name="client_id"
            label="Ваш Client ID от Авито"
            rules={[{ required: true, message: 'Введите ваш Client ID' }]}
          >
            <Input placeholder="Введите ваш Client ID от Авито" />
          </Form.Item>

          <Form.Item
            name="client_secret"
            label="Ваш Client Secret от Авито"
            rules={[{ required: true, message: 'Введите ваш Client Secret' }]}
          >
            <Input.Password placeholder="Введите ваш Client Secret от Авито" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                Сохранить настройки
              </Button>
              {!settings?.connected && (
                <Button 
                  type="default"
                  onClick={async () => {
                    const values = form.getFieldsValue();
                    if (!values.client_id || !values.client_secret) {
                      message.error('Введите Client ID и Client Secret');
                      return;
                    }
                    
                    setLoading(true);
                    try {
                      const response = await fetch('/api/avito-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          client_id: values.client_id,
                          client_secret: values.client_secret,
                          user_id: userId
                        })
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        message.success(data.message || 'Подключение успешно!');
                        loadSettings();
                      } else {
                        const error = await response.json();
                        message.error(error.error || 'Ошибка подключения');
                      }
                    } catch (error) {
                      message.error('Ошибка подключения');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  loading={loading}
                  icon={<ApiOutlined />}
                >
                  Подключить Авито
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};