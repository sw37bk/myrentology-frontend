import React, { useState, useEffect } from 'react';
import { Card, Button, Switch, Input, message } from 'antd';
import { SaveOutlined, RobotOutlined, MessageOutlined } from '@ant-design/icons';
import { aiAssistantApi } from '../../services/aiAssistant';
import { AISettings } from '../../types';

const { TextArea } = Input;

export const AIAssistantSettings: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>({
    user_id: 1,
    auto_booking_enabled: false,
    response_style: 'friendly',
    has_openai_key: false
  });
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await aiAssistantApi.getSettings(1);
      setSettings(data);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/ai-assistant.php?action=settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        message.success('Настройки сохранены!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Ошибка сохранения настроек');
    }
  };

  const testAI = async () => {
    if (!testMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await aiAssistantApi.generateResponse(1, 'test', testMessage);
      setTestResponse(response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      message.error('Ошибка генерации ответа AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card 
        title={
          <span>
            <RobotOutlined style={{ marginRight: 8 }} />
            Настройки AI Ассистента
          </span>
        }
        size="small"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f0f8ff', border: '1px solid #d6e4ff', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <RobotOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#1890ff' }}>Статус OpenAI</span>
            </div>
            <p style={{ fontSize: '13px', color: '#1890ff', margin: 0 }}>
              {settings.has_openai_key ? 
                '✓ OpenAI API ключ настроен администратором' : 
                '⚠ OpenAI API ключ не настроен. Обратитесь к администратору.'
              }
            </p>
            <p style={{ fontSize: '13px', color: '#1890ff', margin: '4px 0 0 0' }}>
              Модель: {settings.model}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Системный промпт</label>
            <TextArea
              placeholder="Ты - AI ассистент по аренде автомобилей..."
              value={settings.system_prompt || ''}
              onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
              rows={6}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Базовые инструкции для AI. Условия бронирования добавляются автоматически.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Автоматическое создание бронирований</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>AI сможет создавать брони в календаре</p>
            </div>
            <Switch
              checked={settings.auto_booking_enabled}
              onChange={(checked) => setSettings({...settings, auto_booking_enabled: checked})}
            />
          </div>

          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={saveSettings}
            block
          >
            Сохранить настройки
          </Button>
        </div>
      </Card>

      <Card 
        title={
          <span>
            <MessageOutlined style={{ marginRight: 8 }} />
            Тестирование AI
          </span>
        }
        size="small"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Тестовое сообщение</label>
            <TextArea
              placeholder="Привет! Интересует аренда автомобиля на выходные..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="primary" 
            onClick={testAI} 
            disabled={isLoading || !settings.has_openai_key}
            loading={isLoading}
            block
          >
            {isLoading ? 'Генерация ответа...' : 'Протестировать AI'}
          </Button>

          {testResponse && (
            <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>Ответ AI:</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>{testResponse}</p>
            </div>
          )}

          {!settings.has_openai_key && (
            <div style={{ padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#d48806' }}>
                Для тестирования необходимо настроить OpenAI API Key в админке
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};