import React from 'react';
import { Card, Form, Input, Button, Alert, Space, Typography } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { avitoApi } from '../../services/avitoService';

const { Title, Paragraph, Text } = Typography;

export const AvitoSettings: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['avito-settings'],
    queryFn: avitoApi.getSettings,
  });

  const saveMutation = useMutation({
    mutationFn: avitoApi.saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avito-settings'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: avitoApi.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avito-settings'] });
      form.resetFields();
    },
  });

  const onFinish = (values: any) => {
    saveMutation.mutate({
      user_id: 1,
      client_id: values.client_id,
      client_secret: values.client_secret,
      is_connected: false,
    });
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card>
        <Title level={3}>Настройки интеграции с Авито</Title>
        
        <Paragraph>
          Для подключения интеграции с Авито:
        </Paragraph>

        <ol>
          <li>Получите Client ID и Client Secret в <a href="https://avito.ru/profile/messenger" target="_blank" rel="noopener noreferrer">настройках мессенджера Авито</a></li>
          <li>Введите ваши ключи ниже</li>
          <li>Мы автоматически настроим получение сообщений</li>
        </ol>

        {settings?.is_connected && (
          <Alert
            message="Интеграция активна"
            description={`Последняя синхронизация: ${settings.last_sync ? new Date(settings.last_sync).toLocaleString('ru-RU') : 'никогда'}`}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button 
                size="small" 
                danger 
                loading={disconnectMutation.isPending}
                onClick={() => disconnectMutation.mutate()}
              >
                Отключить
              </Button>
            }
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={settings || undefined}
        >
          <Form.Item
            name="client_id"
            label="Ваш Client ID от Авито"
            rules={[{ required: true, message: 'Введите ваш Client ID' }]}
          >
            <Input placeholder="Введите ваш Client ID от Авито" />
          </Form.Item>

          <Form.Item
            name="client_secret"
            label="Ваш Client Secret от Авито"
            rules={[{ required: true, message: 'Введите ваш Client Secret' }]}
          >
            <Input.Password placeholder="Введите ваш Client Secret от Авито" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saveMutation.isPending}
              >
                {settings?.is_connected ? 'Обновить настройки' : 'Подключить'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};