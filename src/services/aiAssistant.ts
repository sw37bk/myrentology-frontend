interface AISettings {
  user_id: number;
  openai_api_key?: string;
  model: string;
  system_prompt?: string;
  auto_booking_enabled: boolean;
  response_style: string;
}

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

interface AutoBooking {
  user_id: number;
  resource_id: number;
  chat_id: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  ai_context: any;
}

const API_BASE = '/api';

export const aiAssistantApi = {
  // AI Settings
  getSettings: async (userId: number): Promise<AISettings> => {
    const response = await fetch(`${API_BASE}/ai-assistant.php?action=settings&user_id=${userId}`);
    return response.json();
  },

  saveSettings: async (settings: AISettings): Promise<void> => {
    const response = await fetch(`${API_BASE}/ai-assistant.php?action=settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to save settings');
  },

  // Booking Templates
  getTemplates: async (userId: number): Promise<BookingTemplate[]> => {
    const response = await fetch(`${API_BASE}/booking-conditions.php?user_id=${userId}`);
    const data = await response.json();
    return data.templates || [];
  },

  createTemplate: async (template: Omit<BookingTemplate, 'id'>): Promise<BookingTemplate> => {
    const response = await fetch(`${API_BASE}/booking-conditions.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return response.json();
  },

  // Resource Conditions
  getResourceConditions: async (userId: number, resourceId: number): Promise<ResourceConditions> => {
    const response = await fetch(`${API_BASE}/booking-conditions.php?user_id=${userId}&resource_id=${resourceId}`);
    return response.json();
  },

  updateResourceConditions: async (conditions: ResourceConditions & { user_id: number }): Promise<void> => {
    const response = await fetch(`${API_BASE}/booking-conditions.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conditions)
    });
    if (!response.ok) throw new Error('Failed to update conditions');
  },

  // AI Response Generation
  generateResponse: async (userId: number, chatId: string, message: string, resourceId?: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/ai-assistant.php?action=generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        chat_id: chatId,
        message,
        resource_id: resourceId
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.response;
  },

  // Auto Booking
  createAutoBooking: async (booking: AutoBooking): Promise<{ booking_id: number }> => {
    const response = await fetch(`${API_BASE}/ai-assistant.php?action=create_booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    return response.json();
  },

  // Process incoming message with AI
  processIncomingMessage: async (userId: number, chatId: string, message: string, resourceId?: number): Promise<{ shouldReply: boolean; replyText?: string }> => {
    try {
      const aiResponse = await aiAssistantApi.generateResponse(userId, chatId, message, resourceId);
      return { shouldReply: true, replyText: aiResponse };
    } catch (error) {
      console.error('AI processing error:', error);
      return { shouldReply: false };
    }
  }
};