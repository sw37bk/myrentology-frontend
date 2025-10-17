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
        // Настройки не найдены - это нормально
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
          userId: userId,
          clientId: values.client_id,
          clientSecret: values.client_secret,
          accessToken: values.access_token || null,
          isActive: true
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

  const startOAuthFlow = () => {
    const values = form.getFieldsValue();
    if (!values.client_id) {
      message.error('Введите Client ID');
      return;
    }

    const scopes = 'messenger:read,messenger:write,items:info,stats:read';
    const redirectUri = 'https://myrentology.ru';
    const state = Math.random().toString(36).substring(7);
    
    localStorage.setItem('avito_oauth_state', state);
    localStorage.setItem('avito_oauth_user_id', userId.toString());
    
    const authUrl = `https://avito.ru/oauth?response_type=code&client_id=${values.client_id}&scope=${scopes}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    window.open(authUrl, 'avitoAuth', 'width=600,height=700');
    
    // Прослушиваем сообщения от popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AVITO_AUTH_SUCCESS') {
        message.success('Подключение успешно!');
        loadSettings();
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'AVITO_AUTH_ERROR') {
        message.error('Ошибка авторизации');
        window.removeEventListener('message', handleMessage);
      }
    };
    
    window.addEventListener('message', handleMessage);
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/avito-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId,
          clientId: '',
          clientSecret: '',
          accessToken: null,
          isActive: false
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

        {settings?.isConnected ? (
          <Alert
            message="Интеграция активна"
            description={`Последняя синхронизация: ${settings.lastSync ? new Date(settings.lastSync).toLocaleString('ru-RU') : 'никогда'}`}
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
        ) : (
          <Alert
            message="Интеграция не настроена"
            description="Введите ваши ключи API и нажмите 'Подключить через Авито'"
            type="info"
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
              <Button 
                type="default"
                onClick={async () => {
                  const values = form.getFieldsValue();
                  if (!values.client_id || !values.client_secret) {
                    message.error('Введите Client ID и Client Secret');
                    return;
                  }
                  
                  setTestingConnection(true);
                  try {
                    const response = await fetch('/api/avito-test-connection', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        client_id: values.client_id, 
                        client_secret: values.client_secret 
                      })
                    });
                    
                    if (response.ok) {
                      message.success('Подключение к Avito API успешно!');
                    } else {
                      const error = await response.json();
                      message.error(error.error || 'Ошибка подключения к Avito API');
                    }
                  } catch (error) {
                    message.error('Ошибка тестирования подключения');
                  } finally {
                    setTestingConnection(false);
                  }
                }}
                loading={testingConnection}
                icon={<ApiOutlined />}
              >
                Тест подключения
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};