import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Form, InputNumber, Button, message, Divider } from 'antd';
import { SecurityScanOutlined, UserOutlined, ShopOutlined, DollarOutlined, SettingOutlined } from '@ant-design/icons';


export const AdminPageSimple: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSaveSettings = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Настройки сохранены!');
    } catch (error) {
      message.error('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Card 
        title={
          <span>
            <SecurityScanOutlined style={{ marginRight: 8 }} />
            Панель администратора - Рентология
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Всего пользователей"
              value={156}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Активных бронирований"
              value={23}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Доход за месяц"
              value={125000}
              prefix={<DollarOutlined />}
              suffix="₽"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Конверсия"
              value={68.5}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title={
              <span>
                <SettingOutlined style={{ marginRight: 8 }} />
                Настройки системы
              </span>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveSettings}
              initialValues={{
                demo_period_days: 5,
                trial_full_access_days: 5,
                basic_price: 1990,
                pro_price: 4990
              }}
            >
              <Form.Item
                name="demo_period_days"
                label="Период демо-доступа (дни)"
                rules={[{ required: true, message: 'Укажите количество дней' }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="5"
                />
              </Form.Item>
              
              <Form.Item
                name="trial_full_access_days"
                label="Полный функционал для trial (дни)"
                rules={[{ required: true, message: 'Укажите количество дней' }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="5"
                />
              </Form.Item>
              
              <Divider />
              
              <Form.Item
                name="basic_price"
                label="Цена Basic тарифа (руб/мес)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="1990"
                />
              </Form.Item>
              
              <Form.Item
                name="pro_price"
                label="Цена PRO тарифа (руб/мес)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="4990"
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Сохранить настройки
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Статистика системы">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Активных PRO"
                  value={45}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="На демо"
                  value={23}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};