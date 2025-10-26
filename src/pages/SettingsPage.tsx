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
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Интеграция с Авито" size="small">
            <AvitoSettings userId={user?.id || 999} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Интеграция с Telegram" size="small">
            <TelegramLink />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Настройки уведомлений" size="small">
            <NotificationSettings />
          </Card>
        </Col>
      </Row>
    </div>
  );
};