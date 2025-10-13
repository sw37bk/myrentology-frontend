import React from 'react';
import { Card, Alert } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

export const ChatsPageSimple: React.FC = () => {
  return (
    <div>
      <Card 
        title={
          <span>
            <MessageOutlined style={{ marginRight: 8 }} />
            Переписки с клиентами - Рентология
          </span>
        }
      >
        <Alert
          message="Интеграция с Авито"
          description="Функционал переписок с клиентами через Авито находится в разработке. Скоро здесь появится полнофункциональная система автоматических ответов и управления чатами."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};