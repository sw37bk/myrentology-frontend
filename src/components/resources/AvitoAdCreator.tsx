import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, Button, message, Steps, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { avitoAdsApi } from '../../services/avitoAds';
import { Product } from '../../types';

interface AvitoAdCreatorProps {
  resource: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adId: string, adUrl: string) => void;
}

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

export const AvitoAdCreator: React.FC<AvitoAdCreatorProps> = ({ 
  resource, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories] = useState([
    // Транспорт
    { id: 10, name: 'Легковые автомобили', category: 'Транспорт' },
    { id: 11, name: 'Мотоциклы и мототехника', category: 'Транспорт' },
    { id: 12, name: 'Грузовики и спецтехника', category: 'Транспорт' },
    { id: 13, name: 'Водный транспорт', category: 'Транспорт' },
    
    // Недвижимость
    { id: 25, name: 'Квартиры', category: 'Недвижимость' },
    { id: 27, name: 'Дома, дачи, коттеджи', category: 'Недвижимость' },
    { id: 30, name: 'Коммерческая недвижимость', category: 'Недвижимость' },
    
    // Услуги
    { id: 115, name: 'Предложения услуг', category: 'Услуги' },
    
    // Бытовая техника
    { id: 43, name: 'Бытовая техника', category: 'Для дома' },
    { id: 44, name: 'Мебель и интерьер', category: 'Для дома' },
    { id: 47, name: 'Ремонт и строительство', category: 'Для дома' },
    
    // Электроника
    { id: 52, name: 'Настольные компьютеры', category: 'Электроника' },
    { id: 53, name: 'Ноутбуки', category: 'Электроника' },
    { id: 58, name: 'Фототехника', category: 'Электроника' },
    
    // Хобби и отдых
    { id: 61, name: 'Велосипеды', category: 'Хобби и отдых' },
    { id: 64, name: 'Музыкальные инструменты', category: 'Хобби и отдых' },
    { id: 66, name: 'Спорт и отдых', category: 'Хобби и отдых' },
    
    // Бизнес
    { id: 75, name: 'Готовый бизнес', category: 'Бизнес' },
    { id: 76, name: 'Оборудование для бизнеса', category: 'Бизнес' }
  ]);
  const [locations] = useState([
    { id: 637640, name: 'Москва' },
    { id: 641780, name: 'Санкт-Петербург' },
    { id: 637680, name: 'Московская область' }
  ]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Получаем настройки Авито из localStorage
      const avitoSettings = JSON.parse(localStorage.getItem('avito_settings') || '{}');
      
      if (!avitoSettings.client_id || !avitoSettings.access_token) {
        message.error('Настройте интеграцию с Авито');
        return;
      }

      const adData = {
        title: values.title,
        description: values.description,
        price: values.price,
        category_id: values.category_id,
        location_id: values.location_id,
        images: values.images || [],
        contact_phone: values.contact_phone,
        contact_name: values.contact_name,
        params: {
          make: values.make,
          model: values.model,
          year: values.year,
          transmission: values.transmission,
          fuel_type: values.fuel_type,
          body_type: values.body_type
        }
      };

      const result = await avitoAdsApi.createAd(adData, {
        client_id: avitoSettings.client_id,
        access_token: avitoSettings.access_token
      });

      message.success('Объявление создано на Авито!');
      onSuccess(result.id, result.url);
      onClose();
    } catch (error) {
      message.error('Ошибка создания объявления: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Основная информация',
      content: (
        <>
          <Form.Item
            name="title"
            label="Название объявления"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="BMW X5 2020 в аренду" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Подробное описание автомобиля, условия аренды..."
              maxLength={3000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Цена за день (руб)"
                rules={[{ required: true, message: 'Укажите цену' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="5000"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Категория"
                rules={[{ required: true, message: 'Выберите категорию' }]}
              >
                <Select placeholder="Выберите категорию" showSearch>
                  {Object.entries(
                    categories.reduce((acc, cat) => {
                      if (!acc[cat.category]) acc[cat.category] = [];
                      acc[cat.category].push(cat);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ).map(([categoryName, items]) => (
                    <Select.OptGroup key={categoryName} label={categoryName}>
                      {items.map(cat => (
                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                      ))}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      )
    },
    {
      title: 'Характеристики',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="make" label="Марка">
                <Input placeholder="BMW" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="model" label="Модель">
                <Input placeholder="X5" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="year" label="Год">
                <InputNumber 
                  style={{ width: '100%' }}
                  min={1990}
                  max={new Date().getFullYear()}
                  placeholder="2020"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="transmission" label="КПП">
                <Select placeholder="Выберите">
                  <Option value="automatic">Автомат</Option>
                  <Option value="manual">Механика</Option>
                  <Option value="robot">Робот</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fuel_type" label="Топливо">
                <Select placeholder="Выберите">
                  <Option value="petrol">Бензин</Option>
                  <Option value="diesel">Дизель</Option>
                  <Option value="hybrid">Гибрид</Option>
                  <Option value="electric">Электро</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="body_type" label="Тип кузова">
            <Select placeholder="Выберите тип кузова">
              <Option value="sedan">Седан</Option>
              <Option value="hatchback">Хэтчбек</Option>
              <Option value="suv">Внедорожник</Option>
              <Option value="wagon">Универсал</Option>
              <Option value="coupe">Купе</Option>
            </Select>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Контакты и локация',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_name"
                label="Контактное лицо"
                rules={[{ required: true, message: 'Введите имя' }]}
              >
                <Input placeholder="Иван Иванов" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact_phone"
                label="Телефон"
                rules={[{ required: true, message: 'Введите телефон' }]}
              >
                <Input placeholder="+7 999 123-45-67" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location_id"
            label="Регион"
            rules={[{ required: true, message: 'Выберите регион' }]}
          >
            <Select placeholder="Выберите регион">
              {locations.map(loc => (
                <Option key={loc.id} value={loc.id}>{loc.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="images" label="Фотографии">
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Загрузить</div>
              </div>
            </Upload>
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <Modal
      title="Создать объявление на Авито"
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Отмена
        </Button>,
        currentStep > 0 && (
          <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
            Назад
          </Button>
        ),
        currentStep < steps.length - 1 ? (
          <Button 
            key="next" 
            type="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Далее
          </Button>
        ) : (
          <Button 
            key="submit" 
            type="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            Создать объявление
          </Button>
        )
      ]}
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(step => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: resource.name,
          description: resource.description,
          price: resource.price
        }}
      >
        {steps[currentStep].content}
      </Form>
    </Modal>
  );
};