import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Space, Tag, Drawer } from 'antd';
import { LinkOutlined, BarChartOutlined, PlusOutlined } from '@ant-design/icons';
import { Product } from '../../types';
import { AvitoAdCreator } from './AvitoAdCreator';
import { avitoAdsApi } from '../../services/avitoAds';

interface ResourceAvitoLinkProps {
  resource: Product;
  onUpdate: (resourceId: number, data: { avito_item_id?: string; avito_url?: string }) => void;
}

export const ResourceAvitoLink: React.FC<ResourceAvitoLinkProps> = ({ resource, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onUpdate(resource.id, {
      avito_item_id: values.avito_item_id,
      avito_url: values.avito_url
    });
    setIsModalOpen(false);
    message.success('Привязка к Авито обновлена');
  };

  return (
    <>
      <Space>
        {resource.avito_item_id ? (
          <Tag color="green" icon={<LinkOutlined />}>
            Привязан к Авито
          </Tag>
        ) : (
          <Tag color="default">
            Не привязан
          </Tag>
        )}
        <Button 
          size="small" 
          icon={<LinkOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          {resource.avito_item_id ? 'Изменить' : 'Привязать'}
        </Button>
        {resource.avito_item_id && (
          <Button 
            size="small" 
            icon={<BarChartOutlined />}
            type="link"
            onClick={async () => {
              try {
                const avitoSettings = JSON.parse(localStorage.getItem('avito_settings') || '{}');
                const stats = await avitoAdsApi.getAdStats(resource.avito_item_id!, {
                  client_id: avitoSettings.client_id,
                  access_token: avitoSettings.access_token
                });
                setAnalytics(stats);
                setIsAnalyticsOpen(true);
              } catch (error) {
                message.error('Ошибка загрузки аналитики');
              }
            }}
          >
            Аналитика
          </Button>
        )}
        <Button 
          size="small" 
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setIsCreatorOpen(true)}
        >
          Создать объявление
        </Button>
      </Space>

      <Modal
        title="Привязка к объявлению Авито"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            avito_item_id: resource.avito_item_id,
            avito_url: resource.avito_url
          }}
        >
          <Form.Item
            name="avito_item_id"
            label="ID объявления Авито"
            rules={[{ required: true, message: 'Введите ID объявления' }]}
          >
            <Input placeholder="2847563921" />
          </Form.Item>

          <Form.Item
            name="avito_url"
            label="Ссылка на объявление"
          >
            <Input placeholder="https://avito.ru/moskva/..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <AvitoAdCreator
        resource={resource}
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSuccess={(adId, adUrl) => {
          onUpdate(resource.id, {
            avito_item_id: adId,
            avito_url: adUrl
          });
        }}
      />

      <Drawer
        title="Аналитика объявления"
        open={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        width={600}
      >
        {analytics && (
          <div>
            <p><strong>Просмотры:</strong> {analytics.views || 0}</p>
            <p><strong>Контакты:</strong> {analytics.contacts || 0}</p>
            <p><strong>Избранное:</strong> {analytics.favorites || 0}</p>
            <p><strong>Сообщения:</strong> {analytics.messages || 0}</p>
            <p><strong>Конверсия:</strong> {analytics.conversion_rate || 0}%</p>
          </div>
        )}
      </Drawer>
    </>
  );
};