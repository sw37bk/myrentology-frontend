import React, { useState } from 'react';
import { Card, Form, Input, Switch, Button, List, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiAssistantApi } from '../../services/aiAssistant';

interface AIPrompt {
  id: number;
  user_id: number;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

const { TextArea } = Input;

export const AISettings: React.FC = () => {
  const [promptForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const queryClient = useQueryClient();

  const { data: prompts = [] } = useQuery({
    queryKey: ['ai-prompts'],
    queryFn: aiAssistantApi.getPrompts,
  });

  const { data: autoReplySettings } = useQuery({
    queryKey: ['auto-reply-settings'],
    queryFn: aiAssistantApi.getAutoReplySettings,
  });

  const createPromptMutation = useMutation({
    mutationFn: aiAssistantApi.createPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      setIsPromptModalOpen(false);
      promptForm.resetFields();
      message.success('Промпт создан');
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AIPrompt> }) =>
      aiAssistantApi.updatePrompt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      setIsPromptModalOpen(false);
      setEditingPrompt(null);
      promptForm.resetFields();
      message.success('Промпт обновлен');
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: aiAssistantApi.deletePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      message.success('Промпт удален');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: aiAssistantApi.updateAutoReplySettings,
    onSuccess: () => {
      message.success('Настройки сохранены');
    },
  });

  const handlePromptSubmit = (values: any) => {
    if (editingPrompt) {
      updatePromptMutation.mutate({
        id: editingPrompt.id,
        data: values,
      });
    } else {
      createPromptMutation.mutate({
        user_id: 1,
        ...values,
      });
    }
  };

  const handleSettingsSubmit = (values: any) => {
    updateSettingsMutation.mutate(values);
  };

  const handleEditPrompt = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    promptForm.setFieldsValue(prompt);
    setIsPromptModalOpen(true);
  };

  const handleDeletePrompt = (id: number) => {
    Modal.confirm({
      title: 'Удалить промпт?',
      content: 'Это действие нельзя отменить.',
      onOk: () => deletePromptMutation.mutate(id),
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="Настройки автоответчика">
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSettingsSubmit}
          initialValues={autoReplySettings}
        >
          <Form.Item
            name="enabled"
            label="Автоответчик"
            valuePropName="checked"
          >
            <Switch checkedChildren="Включен" unCheckedChildren="Выключен" />
          </Form.Item>

          <Form.Item
            name="response_delay"
            label="Задержка ответа (минут)"
          >
            <Input type="number" min={0} max={60} />
          </Form.Item>

          <Form.Item
            name="working_hours_start"
            label="Начало рабочего дня"
          >
            <Input type="time" />
          </Form.Item>

          <Form.Item
            name="working_hours_end"
            label="Конец рабочего дня"
          >
            <Input type="time" />
          </Form.Item>

          <Form.Item
            name="welcome_message"
            label="Приветственное сообщение"
          >
            <TextArea rows={3} placeholder="Сообщение для первого контакта..." />
          </Form.Item>

          <Form.Item
            name="offline_message"
            label="Сообщение вне рабочего времени"
          >
            <TextArea rows={3} placeholder="Сообщение когда вы не онлайн..." />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={updateSettingsMutation.isPending}
            >
              Сохранить настройки
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card 
        title="AI Промпты"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPrompt(null);
              promptForm.resetFields();
              setIsPromptModalOpen(true);
            }}
          >
            Добавить промпт
          </Button>
        }
      >
        <List
          dataSource={prompts}
          renderItem={(prompt) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditPrompt(prompt)}
                >
                  Редактировать
                </Button>,
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeletePrompt(prompt.id)}
                >
                  Удалить
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {prompt.name}
                    {prompt.is_active && <Tag color="green">Активный</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      {prompt.prompt_text.length > 100 
                        ? prompt.prompt_text.substring(0, 100) + '...' 
                        : prompt.prompt_text
                      }
                    </div>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => updatePromptMutation.mutate({
                        id: prompt.id,
                        data: { is_active: !prompt.is_active }
                      })}
                    >
                      {prompt.is_active ? 'Деактивировать' : 'Активировать'}
                    </Button>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingPrompt ? 'Редактировать промпт' : 'Новый промпт'}
        open={isPromptModalOpen}
        onCancel={() => {
          setIsPromptModalOpen(false);
          setEditingPrompt(null);
          promptForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={promptForm}
          layout="vertical"
          onFinish={handlePromptSubmit}
        >
          <Form.Item
            name="name"
            label="Название промпта"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Основной промпт, для авто и т.д." />
          </Form.Item>

          <Form.Item
            name="prompt_text"
            label="Текст промпта"
            rules={[{ required: true, message: 'Введите текст промпта' }]}
          >
            <TextArea
              rows={12}
              placeholder="Ты - помощник по аренде автомобилей. Отвечай вежливо и профессионально..."
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Активный"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createPromptMutation.isPending || updatePromptMutation.isPending}
              >
                {editingPrompt ? 'Обновить' : 'Создать'}
              </Button>
              <Button 
                onClick={() => {
                  setIsPromptModalOpen(false);
                  setEditingPrompt(null);
                  promptForm.resetFields();
                }}
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};