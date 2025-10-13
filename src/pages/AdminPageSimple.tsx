import React from 'react';
import { Card, Alert } from 'antd';
import { SecurityScanOutlined } from '@ant-design/icons';

export const AdminPageSimple: React.FC = () => {
  return (
    <Card 
      title={
        <span>
          <SecurityScanOutlined style={{ marginRight: 8 }} />
          Панель администратора - Рентология
        </span>
      }
    >
      <Alert
        message="Админ-панель"
        description="Административная панель находится в разработке. Скоро здесь появится полная статистика и управление системой."
        type="info"
        showIcon
      />
    </Card>
  );
};