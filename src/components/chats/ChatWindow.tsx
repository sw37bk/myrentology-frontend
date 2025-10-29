import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar, Space, Typography, Spin, Row, Col } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { AIAssistantIntegration } from './AIAssistantIntegration';

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

const { TextArea } = Input;
const { Text } = Typography;

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  loading?: boolean;
  sending?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  loading,
  sending,
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !chat) return;

    await onSendMessage(messageText.trim());
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        color: '#999'
      }}>
        Выберите чат для начала переписки
      </div>
    );
  }

  return (
    <Row style={{ height: '100%' }}>
      <Col span={18} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Text strong>{chat.customer_name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {chat.item_title} • {chat.customer_phone}
              </Text>
            </div>
          </Space>
        </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item style={{ 
                border: 'none', 
                padding: '8px 0',
                justifyContent: message.direction === 'outgoing' ? 'flex-end' : 'flex-start'
              }}>
                <Space 
                  align="start" 
                  style={{ 
                    maxWidth: '70%',
                    flexDirection: message.direction === 'outgoing' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar 
                    size="small"
                    icon={message.direction === 'outgoing' ? <RobotOutlined /> : <UserOutlined />}
                    style={{ 
                      backgroundColor: message.direction === 'outgoing' ? '#1890ff' : '#52c41a'
                    }}
                  />
                  <div style={{
                    background: message.direction === 'outgoing' ? '#1890ff' : '#f0f0f0',
                    color: message.direction === 'outgoing' ? 'white' : 'black',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    wordBreak: 'break-word'
                  }}>
                    {message.text}
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.7,
                      marginTop: '4px',
                      textAlign: message.direction === 'outgoing' ? 'right' : 'left'
                    }}>
                      {new Date(message.timestamp).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ resize: 'none' }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              disabled={!messageText.trim()}
            >
              Отправить
            </Button>
          </Space.Compact>
        </div>
      </Col>
      
      <Col span={6} style={{ borderLeft: '1px solid #f0f0f0', padding: '16px' }}>
        <AIAssistantIntegration 
          chatId={chat.avito_chat_id}
          resourceId={parseInt(chat.item_id)}
          onAIResponse={(response) => {
            setMessageText(response);
          }}
        />
      </Col>
    </Row>
  );
};