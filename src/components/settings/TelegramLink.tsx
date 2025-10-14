import React, { useState } from 'react';
import { Card, Button, Input, Alert, Space, Typography } from 'antd';
import { SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { telegramApi } from '../../services/telegramService';

const { Title, Paragraph, Text } = Typography;

export const TelegramLink: React.FC = () => {
  const [telegramContact, setTelegramContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  const handleLinkAccount = async () => {
    if (!telegramContact) return;
    
    setIsLoading(true);
    try {
      await telegramApi.registerUser(telegramContact, 'pending');
      setIsLinked(true);
    } catch (error) {
      console.error('Link failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinked) {
    return (
      <Card>
        <Alert
          message="Запрос отправлен"
          description="Перейдите в Telegram бот и подтвердите связывание аккаунта"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4}>Связать с Telegram</Title>
      
      <Paragraph>
        Для получения уведомлений в Telegram:
      </Paragraph>

      <ol>
        <li>Найдите бота <Text code>@rentology_bot</Text> в Telegram</li>
        <li>Нажмите <Text code>/start</Text></li>
        <li>Введите ваш логин Telegram или номер телефона ниже</li>
        <li>Подтвердите связывание в боте</li>
      </ol>

      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Input
          placeholder="@username или +79991234567"
          value={telegramContact}
          onChange={(e) => setTelegramContact(e.target.value)}
          size="large"
        />
        
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleLinkAccount}
          loading={isLoading}
          disabled={!telegramContact}
          size="large"
        >
          Связать аккаунт
        </Button>
      </Space>
    </Card>
  );
};