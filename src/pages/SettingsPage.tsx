import React, { useState } from 'react';
import { Card, Row, Col, Tabs } from 'antd';
import { TelegramLink } from '../components/settings/TelegramLink';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import { AvitoSettings } from '../components/settings/AvitoSettings';
import { AIAssistantSettings } from '../components/settings/AIAssistantSettings';
import { BookingConditionsSettings } from '../components/settings/BookingConditionsSettings';
import { useAuthStore } from '../stores/authStore';

const { TabPane } = Tabs;

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('integrations');

  return (
    <div style={{ padding: '24px' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Интеграции" key="integrations">
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
        </TabPane>
        
        <TabPane tab="AI Ассистент" key="ai">
          <AIAssistantSettings />
        </TabPane>
        
        <TabPane tab="Условия бронирования" key="booking">
          <BookingConditionsSettings />
        </TabPane>
      </Tabs>
    </div>
  );
};