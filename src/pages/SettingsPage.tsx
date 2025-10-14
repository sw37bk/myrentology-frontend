import React from 'react';
import { Card, Row, Col } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { TelegramLink } from '../components/settings/TelegramLink';
import { NotificationSettings } from '../components/notifications/NotificationSettings';

export const SettingsPage: React.FC = () => {
  return (
    <Card title={<><SettingOutlined /> Настройки</>}>
      <Row gutter={16}>
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