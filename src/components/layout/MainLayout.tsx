import React from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarOutlined,
  ShopOutlined,
  MessageOutlined,
  DollarOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Календарь',
    },
    {
      key: '/resources',
      icon: <ShopOutlined />,
      label: 'Ресурсы',
    },
    {
      key: '/chats',
      icon: <MessageOutlined />,
      label: 'Переписки',
    },
    {
      key: '/finances',
      icon: <DollarOutlined />,
      label: 'Финансы',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
    ...(user?.role === 'admin' ? [{
      key: '/admin',
      icon: <SecurityScanOutlined />,
      label: 'Админка',
    }] : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        theme="dark"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: '18px',
            textAlign: 'center'
          }}>
            РЕНТОЛОГИЯ
          </div>
          <Text 
            style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '12px',
              textAlign: 'center'
            }}
          >
            Платформа аренды
          </Text>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            border: 'none'
          }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px #f0f1f2',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ color: '#666', fontSize: '16px' }}>
            {getPageTitle(location.pathname)}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 'auto', padding: '8px 12px' }}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: user?.subscription_tier === 'pro' ? '#722ed1' : 
                                 user?.subscription_tier === 'basic' ? '#1890ff' : '#faad14'
                }}
              />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{user?.email}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {user?.subscription_tier === 'pro' ? 'PRO' : 
                   user?.subscription_tier === 'basic' ? 'Базовый' : 'Пробный'}
                </div>
              </div>
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

// Вспомогательная функция для заголовков страниц
const getPageTitle = (pathname: string) => {
  const titles: { [key: string]: string } = {
    '/calendar': 'Календарь бронирований',
    '/resources': 'Управление ресурсами',
    '/chats': 'Переписки с клиентами',
    '/finances': 'Финансовая аналитика',
    '/settings': 'Настройки системы',
    '/admin': 'Панель администратора',
  };
  return titles[pathname] || 'Рентология';
};