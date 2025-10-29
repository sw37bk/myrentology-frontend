import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Tag, Button, Modal, Descriptions } from 'antd';
import { UserOutlined, MessageOutlined, PhoneOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  total_bookings: number;
  total_spent: number;
  last_contact_date: string;
  pending_bookings: number;
  total_messages: number;
}

interface Interaction {
  id: number;
  message_type: 'incoming' | 'outgoing' | 'system';
  message_text: string;
  ai_generated: boolean;
  resource_name?: string;
  created_at: string;
}

export const CustomerHistory: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customer-management.php?action=list&user_id=1');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadCustomerHistory = async (customerId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customer-management.php?action=history&customer_id=${customerId}`);
      const data = await response.json();
      setInteractions(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const showCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
    loadCustomerHistory(customer.id);
  };

  const getMessageTypeColor = (type: string, aiGenerated: boolean) => {
    if (aiGenerated) return 'purple';
    return type === 'incoming' ? 'blue' : 'green';
  };

  const getMessageTypeText = (type: string, aiGenerated: boolean) => {
    if (aiGenerated) return 'AI';
    return type === 'incoming' ? 'Клиент' : 'Мы';
  };

  return (
    <div>
      <Card title="История клиентов" size="small">
        <List
          dataSource={customers}
          renderItem={(customer) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => showCustomerDetails(customer)}
                  icon={<MessageOutlined />}
                >
                  История
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{customer.name}</span>
                    {customer.pending_bookings > 0 && (
                      <Tag color="orange">{customer.pending_bookings} ожидает</Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                      {customer.phone && (
                        <span><PhoneOutlined /> {customer.phone}</span>
                      )}
                      {customer.email && (
                        <span><MailOutlined /> {customer.email}</span>
                      )}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                      Бронирований: {customer.total_bookings} • 
                      Потрачено: {customer.total_spent}₽ • 
                      Сообщений: {customer.total_messages}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={selectedCustomer ? `История: ${selectedCustomer.name}` : 'История клиента'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCustomer && (
          <div style={{ marginBottom: '16px' }}>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="Телефон">{selectedCustomer.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedCustomer.email}</Descriptions.Item>
              <Descriptions.Item label="Бронирований">{selectedCustomer.total_bookings}</Descriptions.Item>
              <Descriptions.Item label="Потрачено">{selectedCustomer.total_spent}₽</Descriptions.Item>
              <Descriptions.Item label="Последний контакт">
                {new Date(selectedCustomer.last_contact_date).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        <List
          loading={loading}
          dataSource={interactions}
          renderItem={(interaction) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Tag color={getMessageTypeColor(interaction.message_type, interaction.ai_generated)}>
                    {getMessageTypeText(interaction.message_type, interaction.ai_generated)}
                  </Tag>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#999' }}>
                    {interaction.resource_name && (
                      <span>📦 {interaction.resource_name}</span>
                    )}
                    <span>
                      <CalendarOutlined /> {new Date(interaction.created_at).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '14px' }}>
                  {interaction.message_text}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};