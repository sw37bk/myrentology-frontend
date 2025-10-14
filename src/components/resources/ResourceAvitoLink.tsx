import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Space, Tag } from 'antd';
import { LinkOutlined, BarChartOutlined } from '@ant-design/icons';
import { Product } from '../../types';

interface ResourceAvitoLinkProps {
  resource: Product;
  onUpdate: (resourceId: number, data: { avito_item_id?: string; avito_url?: string }) => void;
}

export const ResourceAvitoLink: React.FC<ResourceAvitoLinkProps> = ({ resource, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          >
            Аналитика
          </Button>
        )}
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
    </>
  );
};