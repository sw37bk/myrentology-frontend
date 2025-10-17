import React from 'react';
import { Card, Row, Col } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { TelegramLink } from '../components/settings/TelegramLink';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import { AvitoSettings } from '../components/settings/AvitoSettings';
import { useAuthStore } from '../stores/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Card title={<><SettingOutlined /> Настройки</>}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AvitoSettings userId={user?.id || 999} />
        </Col>
        <Col span={12}>
          <TelegramLink />
        </Col>
        <Col span={12}>
          <NotificationSettings />
        </Col>
      </Row>
    </Card>
  );
};