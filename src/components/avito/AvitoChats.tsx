import React, { useState, useEffect } from 'react';
import { Card, List, Input, Button, message, Typography, Alert, Space } from 'antd';
import { MessageOutlined, SendOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface Chat {
  id: string;
  users: Array<{ id: number; name: string; }>;
  last_message?: {
    content: { text?: string };
    created: number;
    direction: 'in' | 'out';
  };
  context?: {
    value: { title?: string; };
  };
}

interface Message {
  id: string;
  content: { text?: string };
  created: number;
  direction: 'in' | 'out';
  author_id: number;
}

interface AvitoChatsProps {
  userId: number;
}

export const AvitoChats: React.FC<AvitoChatsProps> = ({ userId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [avitoConnected, setAvitoConnected] = useState(false);

  useEffect(() => {
    checkAvitoConnection();
    loadChats();
  }, [userId]);

  const checkAvitoConnection = async () => {
    try {
      const response = await fetch(`/api/avito-user-status?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAvitoConnected(data.connected);
      }
    } catch (error) {
      console.error('Ошибка проверки подключения Авито:', error);
    }
  };

  const loadChats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/avito-chats?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        message.error('Ошибка загрузки чатов');
      }
    } catch (error) {
      message.error('Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chat: Chat) => {
    setSelectedChat(chat);
    try {
      const response = await fetch(`/api/avito-messages?user_id=${userId}&chat_id=${chat.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      }
    } catch (error) {
      message.error('Ошибка загрузки сообщений');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/avito-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          chat_id: selectedChat.id,
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(selectedChat);
        message.success('Сообщение отправлено');
      } else {
        message.error('Ошибка отправки');
      }
    } catch (error) {
      message.error('Ошибка отправки');
    }
  };

  return (
    <div>
      <Alert
        message={avitoConnected ? "✅ Авито подключено" : "❌ Авито не подключено"}
        description={avitoConnected ? "Чаты загружаются автоматически" : "Настройте подключение в разделе Настройки"}
        type={avitoConnected ? "success" : "warning"}
        showIcon
        style={{ marginBottom: 16 }}
        action={
          <Space>
            <Button 
              size="small" 
              icon={<SyncOutlined />}
              onClick={loadChats}
              loading={loading}
            >
              Обновить
            </Button>
          </Space>
        }
      />
      
      <div style={{ display: 'flex', height: '600px', gap: '16px' }}>
        <Card 
          title={
            <Space>
              <MessageOutlined />
              Чаты Avito
              {avitoConnected && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
            </Space>
          } 
          style={{ width: '300px' }}
        >
        <List
          loading={loading}
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              onClick={() => loadMessages(chat)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                avatar={<MessageOutlined />}
                title={chat.context?.value?.title || 'Чат'}
                description={chat.last_message?.content?.text || 'Нет сообщений'}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Сообщения" style={{ flex: 1 }}>
        {selectedChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item style={{ 
                    justifyContent: msg.direction === 'out' ? 'flex-end' : 'flex-start' 
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      backgroundColor: msg.direction === 'out' ? '#1890ff' : '#f0f0f0',
                      color: msg.direction === 'out' ? 'white' : 'black'
                    }}>
                      {msg.content?.text}
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                autoSize={{ minRows: 1, maxRows: 3 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                Отправить
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            Выберите чат
          </div>
        )}
        </Card>
      </div>
    </div>
  );
};