import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Space, Divider, message } from 'antd';
import { GiftOutlined, PercentageOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface LoyaltyConfig {
  cashback_enabled: boolean;
  cashback_percentage: number;
  free_hours_enabled: boolean;
  free_hours_threshold: number;
  free_hours_amount: number;
  points_per_ruble: number;
}

export const LoyaltySettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<LoyaltyConfig>({
    cashback_enabled: true,
    cashback_percentage: 5,
    free_hours_enabled: false,
    free_hours_threshold: 10,
    free_hours_amount: 2,
    points_per_ruble: 1
  });

  const handleSave = async (values: LoyaltyConfig) => {
    setLoading(true);
    try {
      // Сохранение настроек лояльности
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfig(values);
      message.success('Настройки программы лояльности сохранены!');
    } catch (error) {
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={
        <span>
          <GiftOutlined style={{ marginRight: 8 }} />
          Программа лояльности
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={config}
        onFinish={handleSave}
      >
        <Card size="small" title="Кэшбэк" style={{ marginBottom: 16 }}>
          <Form.Item name="cashback_enabled" valuePropName="checked">
            <Switch 
              checkedChildren="Включен" 
              unCheckedChildren="Выключен"
            />
          </Form.Item>
          
          <Form.Item
            name="cashback_percentage"
            label="Процент кэшбэка"
            rules={[{ required: true, message: 'Укажите процент кэшбэка' }]}
          >
            <InputNumber
              min={0}
              max={50}
              suffix="%"
              style={{ width: '100%' }}
              placeholder="5"
            />
          </Form.Item>

          <Form.Item
            name="points_per_ruble"
            label="Баллов за 1 рубль"
            rules={[{ required: true, message: 'Укажите количество баллов' }]}
          >
            <InputNumber
              min={0.1}
              max={10}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="1"
            />
          </Form.Item>
        </Card>

        <Card size="small" title="Бесплатные часы аренды" style={{ marginBottom: 16 }}>
          <Form.Item name="free_hours_enabled" valuePropName="checked">
            <Switch 
              checkedChildren="Включено" 
              unCheckedChildren="Выключено"
            />
          </Form.Item>

          <Form.Item
            name="free_hours_threshold"
            label="После скольких аренд"
            rules={[{ required: true, message: 'Укажите количество аренд' }]}
          >
            <InputNumber
              min={1}
              max={100}
              style={{ width: '100%' }}
              placeholder="10"
            />
          </Form.Item>

          <Form.Item
            name="free_hours_amount"
            label="Количество бесплатных часов"
            rules={[{ required: true, message: 'Укажите количество часов' }]}
          >
            <InputNumber
              min={1}
              max={24}
              style={{ width: '100%' }}
              placeholder="2"
            />
          </Form.Item>
        </Card>

        <Divider />

        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 6, marginBottom: 16 }}>
          <h4>Предварительный просмотр:</h4>
          <Space direction="vertical">
            {config.cashback_enabled && (
              <div>
                <PercentageOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                Кэшбэк {config.cashback_percentage}% с каждой аренды
              </div>
            )}
            {config.free_hours_enabled && (
              <div>
                <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                {config.free_hours_amount} бесплатных часа после {config.free_hours_threshold} аренд
              </div>
            )}
            <div>
              <GiftOutlined style={{ color: '#722ed1', marginRight: 8 }} />
              {config.points_per_ruble} балл за каждый потраченный рубль
            </div>
          </Space>
        </div>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
          >
            Сохранить настройки лояльности
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};