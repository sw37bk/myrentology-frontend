import React, { useState } from 'react';
import { Card, Switch, Button, Input, Form, Space, List, Tag, message } from 'antd';
import { BellOutlined, SendOutlined, UserAddOutlined, ApiOutlined } from '@ant-design/icons';
import { notificationBot } from '../../services/notificationBot';
import { webhookSetup } from '../../services/webhookSetup';

export const NotificationSettings: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const loadSubscribers = async () => {
    setLoading(true);
    const data = await notificationBot.getSubscribers();
    setSubscribers(data);
    setLoading(false);
  };

  React.useEffect(() => {
    loadSubscribers();
  }, []);

  const sendTestNotification = async () => {
    try {
      const result = await notificationBot.broadcast('booking_confirmed', {
        dates: '15.06.2024 - 17.06.2024',
        car: 'BMW X5',
        address: 'ул. Тестовая, 123'
      });
      
      message.success(`Отправлено ${result.sent} уведомлений`);
    } catch (error) {
      message.error('Ошибка отправки');
    }
  };

  return (
    <div>
      <Card title="Настройки уведомлений" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <h4>Автоматические уведомления</h4>
            <Space direction="vertical">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Подтверждение бронирования</span>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Напоминания о бронировании</span>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Уведомления об оплате</span>
                <Switch defaultChecked />
              </div>
            </Space>
          </div>

          <div>
            <h4>Настройка бота</h4>
            <Space>
              <Button 
                icon={<ApiOutlined />}
                onClick={async () => {
                  setLoading(true);
                  const result = await webhookSetup.setWebhook();
                  setLoading(false);
                  if (result?.ok) {
                    message.success('Вебхук установлен!');
                  } else {
                    message.error('Ошибка установки вебхука');
                  }
                }}
                loading={loading}
              >
                Установить вебхук
              </Button>
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                loading={loading}
                onClick={sendTestNotification}
              >
                Тест уведомления
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      <Card 
        title={`Подписчики (${subscribers.length})`}
        extra={
          <Button 
            icon={<UserAddOutlined />}
            onClick={loadSubscribers}
            loading={loading}
          >
            Обновить
          </Button>
        }
      >
        <List
          dataSource={subscribers}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta
                avatar={<BellOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                title={user.first_name}
                description={
                  <Space>
                    <span>@{user.username || 'без username'}</span>
                    {user.phone && <span>{user.phone}</span>}
                  </Space>
                }
              />
              <div>
                {user.notifications.map((type: string) => (
                  <Tag key={type} color="blue">
                    {type === 'booking_confirmed' && 'Подтверждения'}
                    {type === 'booking_reminder' && 'Напоминания'}
                    {type === 'payment_due' && 'Оплата'}
                  </Tag>
                ))}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};