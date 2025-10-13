import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../services/products';
import moment from 'moment';
import type { CalendarEvent } from '../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface BookingModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  event,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
}) => {
  const [form] = Form.useForm();

  const { data: resources = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getList,
  });

  useEffect(() => {
    if (event && event.resource && event.id > 0) {
      const booking = event.resource;
      form.setFieldsValue({
        product_id: booking.product?.id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        date: [moment(booking.start_date), moment(booking.end_date)],
        status: booking.status,
      });
    } else if (event) {
      form.setFieldsValue({
        date: [moment(event.start), moment(event.end)],
        status: 'pending',
      });
    }
  }, [event, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start_date, end_date] = values.date;
      
      onSubmit({
        ...values,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        id: event?.id || undefined,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  return (
    <Modal
      title={event?.id ? 'Редактировать бронирование' : 'Новое бронирование'}
      open={isOpen}
      onCancel={onClose}
      footer={[
        event?.id && (
          <Button key="delete" danger onClick={handleDelete} loading={isLoading}>
            Удалить
          </Button>
        ),
        <Button key="cancel" onClick={onClose}>
          Отмена
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={isLoading}
        >
          {event?.id ? 'Обновить' : 'Создать'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="product_id"
          label="Ресурс"
          rules={[{ required: true, message: 'Выберите ресурс' }]}
        >
          <Select placeholder="Выберите ресурс для аренды">
            {resources.map(resource => (
              <Option key={resource.id} value={resource.id}>
                {resource.name} - {resource.price}₽/день
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="customer_name"
          label="Имя клиента"
          rules={[{ required: true, message: 'Введите имя клиента' }]}
        >
          <Input placeholder="Введите имя клиента" />
        </Form.Item>

        <Form.Item
          name="customer_phone"
          label="Телефон клиента"
          rules={[{ required: true, message: 'Введите телефон клиента' }]}
        >
          <Input placeholder="+7 (XXX) XXX-XX-XX" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Период аренды"
          rules={[{ required: true, message: 'Выберите даты аренды' }]}
        >
          <RangePicker
            showTime
            format="DD.MM.YYYY HH:mm"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Статус"
          rules={[{ required: true, message: 'Выберите статус' }]}
        >
          <Select>
            <Option value="pending">Ожидание</Option>
            <Option value="confirmed">Подтверждено</Option>
            <Option value="cancelled">Отменено</Option>
            <Option value="completed">Завершено</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};