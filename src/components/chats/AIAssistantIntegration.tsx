import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Bot, MessageSquare, Calendar, Settings, Zap } from 'lucide-react';
import { aiAssistantApi } from '../../services/aiAssistant';
import { AISettings } from '../../types';

interface AIAssistantIntegrationProps {
  chatId: string;
  resourceId?: number;
  onAIResponse?: (response: string) => void;
}

export const AIAssistantIntegration: React.FC<AIAssistantIntegrationProps> = ({
  chatId,
  resourceId,
  onAIResponse
}) => {
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);

  useEffect(() => {
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    try {
      const settings = await aiAssistantApi.getSettings(1);
      setAiSettings(settings);
      setAutoReplyEnabled(settings.auto_booking_enabled);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const generateAIResponse = async (message: string) => {
    if (!aiSettings?.has_openai_key) {
      alert('OpenAI API ключ не настроен. Обратитесь к администратору.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await aiAssistantApi.generateResponse(1, chatId, message, resourceId);
      setLastAIResponse(response);
      onAIResponse?.(response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      alert('Ошибка генерации ответа AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const createBookingFromAI = async () => {
    if (!resourceId) {
      alert('Ресурс не выбран для создания бронирования');
      return;
    }

    try {
      // Здесь должна быть логика извлечения данных из контекста чата
      const bookingData = {
        user_id: 1,
        resource_id: resourceId,
        chat_id: chatId,
        customer_name: 'Клиент из чата', // Извлечь из чата
        customer_phone: '+7999999999', // Извлечь из чата
        start_date: '2024-12-20', // Извлечь из AI контекста
        end_date: '2024-12-22', // Извлечь из AI контекста
        total_price: 5000, // Рассчитать
        ai_context: { chat_id: chatId, last_response: lastAIResponse }
      };

      const result = await aiAssistantApi.createAutoBooking(bookingData);
      alert(`Бронирование создано! ID: ${result.booking_id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Ошибка создания бронирования');
    }
  };

  if (!aiSettings) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Bot className="w-4 h-4" />
            <span>Загрузка настроек AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Ассистент
            </div>
            <Badge variant={aiSettings.has_openai_key ? 'default' : 'secondary'}>
              {aiSettings.has_openai_key ? 'Настроен' : 'Не настроен'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiSettings.has_openai_key ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Автоответы</span>
                <Switch
                  checked={autoReplyEnabled}
                  onCheckedChange={setAutoReplyEnabled}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateAIResponse('Тестовое сообщение')}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {isProcessing ? 'Генерация...' : 'Тест AI'}
                </Button>

                {aiSettings.auto_booking_enabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={createBookingFromAI}
                    disabled={!lastAIResponse}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Создать бронь
                  </Button>
                )}
              </div>

              {lastAIResponse && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Bot className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">Последний ответ AI:</p>
                      <p className="text-sm text-gray-700">{lastAIResponse}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <Bot className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">
                OpenAI API ключ не настроен
              </p>
              <p className="text-xs text-gray-500">
                Обратитесь к администратору
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {resourceId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={() => generateAIResponse('Клиент спрашивает о цене')}
              disabled={isProcessing}
            >
              Ответить о цене
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={() => generateAIResponse('Клиент спрашивает о доступности')}
              disabled={isProcessing}
            >
              Проверить доступность
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={() => generateAIResponse('Клиент хочет забронировать')}
              disabled={isProcessing}
            >
              Помочь с бронированием
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};