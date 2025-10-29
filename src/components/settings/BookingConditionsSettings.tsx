import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Tabs, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface BookingTemplate {
  id: number;
  name: string;
  description: string;
  conditions: any;
}

interface ResourceConditions {
  resource_id: number;
  template_id?: number;
  template_name?: string;
  individual_conditions: any;
  template_conditions: any;
  ai_description: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

export const BookingConditionsSettings: React.FC = () => {
  const [templates, setTemplates] = useState<BookingTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [resourceConditions, setResourceConditions] = useState<ResourceConditions | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', conditions: {} });

  useEffect(() => {
    loadTemplates();
    loadProducts();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/booking-conditions.php?user_id=1`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products.php?user_id=1');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadResourceConditions = async (resourceId: number) => {
    try {
      const response = await fetch(`/api/booking-conditions.php?user_id=1&resource_id=${resourceId}`);
      const data = await response.json();
      setResourceConditions(data);
    } catch (error) {
      console.error('Error loading resource conditions:', error);
    }
  };

  const createTemplate = async () => {
    try {
      const response = await fetch('/api/booking-conditions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          ...newTemplate
        })
      });
      
      if (response.ok) {
        setNewTemplate({ name: '', description: '', conditions: {} });
        loadTemplates();
        message.success('Шаблон создан!');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Ошибка создания шаблона');
    }
  };

  const updateResourceConditions = async () => {
    if (!selectedResource || !resourceConditions) return;

    try {
      const response = await fetch('/api/booking-conditions.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          resource_id: selectedResource,
          template_id: resourceConditions.template_id,
          individual_conditions: resourceConditions.individual_conditions,
          ai_description: resourceConditions.ai_description
        })
      });
      
      if (response.ok) {
        message.success('Условия сохранены!');
      }
    } catch (error) {
      console.error('Error updating conditions:', error);
      message.error('Ошибка сохранения условий');
    }
  };

  const tabItems = [
    {
      key: 'templates',
      label: 'Шаблоны условий',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Создать новый шаблон" size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                placeholder="Название шаблона"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              />
              <TextArea
                placeholder="Описание шаблона"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                rows={3}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input placeholder="Залог (%)" />
                <Input placeholder="Минимальный срок (дни)" />
                <Input placeholder="Время подачи (часы)" />
                <Input placeholder="Штраф за отмену (%)" />
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={createTemplate} block>
                Создать шаблон
              </Button>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {templates.map((template) => (
              <Card key={template.id} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500 }}>{template.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{template.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="small" icon={<EditOutlined />} />
                    <Button size="small" icon={<DeleteOutlined />} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'resources',
      label: 'Настройка ресурсов',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Выберите ресурс" size="small">
            <Select
              placeholder="Выберите ресурс"
              style={{ width: '100%' }}
              onChange={(value) => {
                const resourceId = parseInt(value);
                setSelectedResource(resourceId);
                loadResourceConditions(resourceId);
              }}
            >
              {products.map((product) => (
                <Option key={product.id} value={product.id.toString()}>
                  {product.name} - {product.price} руб/день
                </Option>
              ))}
            </Select>
          </Card>

          {selectedResource && resourceConditions && (
            <Card title="Настройка условий" size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Шаблон условий</label>
                  <Select 
                    placeholder="Выберите шаблон или оставьте пустым"
                    style={{ width: '100%' }}
                    value={resourceConditions.template_id?.toString() || undefined} 
                    onChange={(value) => setResourceConditions({
                      ...resourceConditions, 
                      template_id: value ? parseInt(value) : undefined
                    })}
                    allowClear
                  >
                    {templates.map((template) => (
                      <Option key={template.id} value={template.id.toString()}>
                        {template.name}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Описание для AI ассистента</label>
                  <TextArea
                    placeholder="Подробное описание ресурса, особенности, требования..."
                    value={resourceConditions.ai_description || ''}
                    onChange={(e) => setResourceConditions({
                      ...resourceConditions,
                      ai_description: e.target.value
                    })}
                    rows={4}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Индивидуальные условия</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input placeholder="Особый залог" />
                    <Input placeholder="Особые требования" />
                    <Input placeholder="Дополнительные услуги" />
                    <Input placeholder="Ограничения" />
                  </div>
                </div>

                <Button type="primary" icon={<SaveOutlined />} onClick={updateResourceConditions} block>
                  Сохранить условия
                </Button>
              </div>
            </Card>
          )}
        </div>
      )
    }
  ];

  return (
    <Card title="Управление условиями бронирования" size="small">
      <Tabs items={tabItems} />
    </Card>
  );
};