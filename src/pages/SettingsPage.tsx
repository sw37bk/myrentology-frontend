import React from 'react';
import { Card, Row, Col } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { TelegramLink } from '../components/settings/TelegramLink';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import { LoyaltySettings } from '../components/settings/LoyaltySettings';

export const SettingsPage: React.FC = () => {
  return (
    <Card title={<><SettingOutlined /> Настройки</>}>
      <Row gutter={16}>
        <Col span={8}>
          <TelegramLink />
        </Col>
        <Col span={8}>
          <NotificationSettings />
        </Col>
        <Col span={8}>
          <LoyaltySettings />
        </Col>
      </Row>
    </Card>
  );
};