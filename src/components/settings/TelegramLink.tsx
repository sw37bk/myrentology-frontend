import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Typography, Input, Space, message } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { telegramApi } from '../../services/telegramService';
import { useAuthStore } from '../../stores/authStore';

const { Title, Paragraph, Text } = Typography;

export const TelegramLink: React.FC = () => {
  const { user } = useAuthStore();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [linkStatus, setLinkStatus] = useState<any>({ linked: false });
  const [isLinking, setIsLinking] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [linkData, setLinkData] = useState<{token: string, botUrl: string, message: string} | null>(null);

  const checkStatus = async () => {
    if (!user?.id) return;
    
    setCheckingStatus(true);
    try {
      const status = await telegramApi.checkLinkStatus(user.id);
      setLinkStatus(status);
    } catch (error) {
      console.error('Check status failed:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLink = async () => {
    if (!user?.id) {
      message.error('Ошибка авторизации');
      return;
    }
    
    setIsLinking(true);
    try {
      const result = await telegramApi.linkUser(user.id, username, phone);
      setLinkData(result);
      message.success('Токен связывания создан!');
      
      // Ожидаем callback от бота
      const checkCallback = async () => {
        try {
          const response = await fetch(`/api/telegram-link-callback?userId=${user.id}`);
          const data = await response.json();
          
          if (!data.pending) {
            if (data.success) {
              message.success('Аккаунт успешно привязан!');
              setLinkData(null);
              checkStatus();
            } else {
              const errorMsg = data.error === 'token_expired' 
                ? 'Токен истек' 
                : 'Неверный токен';
              message.error(errorMsg);
              setLinkData(null);
            }
            return true;
          }
        } catch (error) {
          console.error('Callback check failed:', error);
        }
        return false;
      };
      
      const interval = setInterval(async () => {
        const completed = await checkCallback();
        if (completed) clearInterval(interval);
      }, 2000);
      
      // Останавливаем проверку через 10 минут
      setTimeout(() => {
        clearInterval(interval);
        setLinkData(null);
        message.warning('Время ожидания связывания истекло');
      }, 600000);
    } catch (error) {
      message.error('Ошибка связывания');
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user?.id]);

  if (checkingStatus) {
    return (
      <Card loading>
        <Title level={4}>Проверка статуса...</Title>
      </Card>
    );
  }

  if (linkStatus.linked) {
    return (
      <Card>
        <Alert
          message="Telegram успешно привязан"
          description={
            <div>
              <div>ID пользователя: {user?.id}</div>
              {linkStatus.username && <div>Никнейм: {linkStatus.username}</div>}
              {linkStatus.phone && <div>Телефон: {linkStatus.phone}</div>}
              <div>Telegram ID: {linkStatus.telegramId}</div>
            </div>
          }
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          action={
            <Button 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={checkStatus}
              loading={checkingStatus}
            >
              Обновить
            </Button>
          }
        />
      </Card>
    );
  }

  if (linkData) {
    return (
      <Card>
        <Title level={4}>Связывание с Telegram</Title>
        
        <Alert
          message="Токен связывания создан"
          description={
            <div>
              <Paragraph>Выберите один из способов:</Paragraph>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>1. Перейти по ссылке:</Text>
                  <br />
                  <Button 
                    type="primary" 
                    href={linkData.botUrl} 
                    target="_blank"
                    style={{ marginTop: 8 }}
                  >
                    Открыть бота
                  </Button>
                </div>
                
                <div>
                  <Text strong>2. Написать боту команду:</Text>
                  <br />
                  <Text code copyable style={{ fontSize: '16px' }}>
                    /start {linkData.token}
                  </Text>
                </div>
              </Space>
              
              <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
                <Text type="secondary">
                  Токен действителен 10 минут. После связывания эта страница обновится автоматически.
                </Text>
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4}>Связать с Telegram</Title>
      
      <Paragraph>
        Для получения уведомлений в Telegram нажмите кнопку ниже:
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Input
          placeholder="@username (необязательно)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          size="large"
        />
        
        <Input
          placeholder="+7999123456 (необязательно)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          size="large"
        />
        
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleLink}
          loading={isLinking}
          size="large"
        >
          Создать ссылку для связывания
        </Button>
      </Space>

      <Alert
        message="Ваш ID на сайте"
        description={`ID: ${user?.id} - этот ID будет связан с вашим Telegram`}
        type="info"
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};