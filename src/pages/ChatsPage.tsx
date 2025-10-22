import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Alert, Button, Space } from 'antd';
import { MessageOutlined, SyncOutlined, RobotOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { avitoApi } from '../services/avitoService';
// Локальные типы для избежания проблем с кэшем
interface Chat {
  id: number;
  avito_chat_id: string;
  item_id: string;
  item_title: string;
  customer_name: string;
  customer_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  chat_id: number;
  message_id: string;
  text: string;
  is_from_customer: boolean;
  timestamp: string;
  is_read: boolean;
  direction: 'incoming' | 'outgoing';
}
import { ChatList } from '../components/chats/ChatList';
import { ChatWindow } from '../components/chats/ChatWindow';
import { AISettings } from '../components/chats/AISettings';
import { AvitoChats } from '../components/avito/AvitoChats';
import { useAuthStore } from '../stores/authStore';

const { TabPane } = Tabs;

export const ChatsPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('chats');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: avitoApi.getChats,
    refetchInterval: 30000,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedChat?.id],
    queryFn: () => selectedChat ? avitoApi.getMessages(selectedChat.id) : [],
    enabled: !!selectedChat,
  });

  const { data: avitoSettings } = useQuery({
    queryKey: ['avito-settings'],
    queryFn: avitoApi.getSettings,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, text }: { chatId: number; text: string }) =>
      avitoApi.sendMessage(chatId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  const handleSendMessage = async (text: string) => {
    if (!selectedChat) return;
    await sendMessageMutation.mutateAsync({ chatId: selectedChat.id, text });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  const handleTestWebhook = async () => {
    await avitoApi.simulateWebhook({
      client_id: 'test_client',
      chat_id: `test_chat_${Date.now()}`,
      message: {
        text: 'Здравствуйте! Это тестовое сообщение от нового клиента',
        type: 'text',
      },
      item: {
        id: 'item_test',
        title: 'Тестовый товар',
      },
      user: {
        name: 'Тестовый Клиент',
        phone: '+79990000000',
      },
      timestamp: Math.floor(Date.now() / 1000),
    });
    handleRefresh();
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <MessageOutlined />
            Переписки с клиентами - Рентология
            {!avitoSettings?.is_connected && (
              <Alert 
                message="Авито не подключен" 
                type="warning" 
                showIcon 
                style={{ display: 'inline-flex', marginLeft: 16 }}
              />
            )}
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<SyncOutlined />} 
              onClick={handleRefresh}
              loading={chatsLoading}
            >
              Обновить
            </Button>
            <Button 
              type="dashed"
              onClick={handleTestWebhook}
            >
              Тест вебхука
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Чаты" key="chats">
            <Row style={{ height: '600px' }}>
              <Col span={8}>
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChat?.id}
                  onChatSelect={setSelectedChat}
                  loading={chatsLoading}
                />
              </Col>
              <Col span={16}>
                <ChatWindow
                  chat={selectedChat}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  loading={messagesLoading}
                  sending={sendMessageMutation.isPending}
                />
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <MessageOutlined />
                Авито чаты
              </span>
            } 
            key="avito-chats"
          >
            {user && <AvitoChats userId={user.id} />}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <RobotOutlined />
                AI Помощник
              </span>
            } 
            key="ai-settings"
          >
            <AISettings />
          </TabPane>


        </Tabs>
      </Card>
    </div>
  );
};