import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const onFinish = async (values: LoginForm) => {
    try {
      await login(values);
      message.success('Вход выполнен успешно!');
      navigate('/calendar');
    } catch (error) {
      message.error('Ошибка входа. Проверьте email и пароль.');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: 12
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ 
            color: '#1890ff',
            margin: 0,
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            РЕНТОЛОГИЯ
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Платформа для управления арендой
          </Text>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
              placeholder="Email" 
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Пароль"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                width: '100%', 
                height: 40,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none'
              }}
              loading={isLoading}
            >
              Войти в систему
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginTop: 24,
          padding: 16,
          background: '#f9f9f9',
          borderRadius: 6
        }}>
          <Text strong>Демо доступ:</Text>
          <div style={{ marginTop: 8 }}>
            <div>Админ: <Text code>admin@rentologiya.ru</Text> / <Text code>admin</Text></div>
            <div>Пользователь: <Text code>user@example.com</Text> / <Text code>password</Text></div>
          </div>
        </div>
      </Card>
    </div>
  );
};