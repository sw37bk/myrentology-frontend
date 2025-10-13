import React from 'react';
import { List, Avatar, Badge, Tag, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

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

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: number;
  onChatSelect: (chat: Chat) => void;
  loading?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  loading,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div style={{ borderRight: '1px solid #f0f0f0', height: '100%' }}>
      <List
        loading={loading}
        dataSource={chats}
        renderItem={(chat) => (
          <List.Item
            onClick={() => onChatSelect(chat)}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedChatId === chat.id ? '#f0f8ff' : 'white',
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge count={chat.unread_count} size="small">
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </Badge>
              }
              title={
                <Space>
                  <span style={{ fontWeight: 'bold' }}>{chat.customer_name}</span>
                  <Tag color="blue" size="small">
                    {chat.item_title}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <div style={{ 
                    color: chat.unread_count > 0 ? '#1890ff' : '#666',
                    fontWeight: chat.unread_count > 0 ? 'bold' : 'normal'
                  }}>
                    {truncateText(chat.last_message)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                    {formatTime(chat.last_message_time)}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};