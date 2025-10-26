import React from 'react';
import { Card, Row, Col } from 'antd';
import { TelegramLink } from '../components/settings/TelegramLink';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import { AvitoSettings } from '../components/settings/AvitoSettings';
import { useAuthStore } from '../stores/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch' }}>
        <Col xs={24} lg={8}>
          <Card 
            title="Интеграция с Авито" 
            size="small" 
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1 }}
          >
            <AvitoSettings userId={user?.id || 999} />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title="Интеграция с Telegram" 
            size="small"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1 }}
          >
            <TelegramLink />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title="Настройки уведомлений" 
            size="small"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1 }}
          >
            <NotificationSettings />
          </Card>
        </Col>
      </Row>
    </div>
  );
};