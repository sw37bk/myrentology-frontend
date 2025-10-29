import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Bot, Calendar, Phone, User, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AutoBooking {
  id: number;
  resource_id: number;
  chat_id: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'rejected';
  ai_context: any;
  created_at: string;
}

export const AutoBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AutoBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutoBookings();
  }, []);

  const loadAutoBookings = async () => {
    try {
      // Здесь должен быть API вызов для получения автобронирований
      const mockBookings: AutoBooking[] = [
        {
          id: 1,
          resource_id: 1,
          chat_id: 'chat_123',
          customer_name: 'Иван Петров',
          customer_phone: '+7999123456',
          start_date: '2024-12-20',
          end_date: '2024-12-22',
          total_price: 5000,
          status: 'pending',
          ai_context: { source: 'avito_chat' },
          created_at: '2024-12-15T10:30:00Z'
        },
        {
          id: 2,
          resource_id: 2,
          chat_id: 'chat_456',
          customer_name: 'Мария Сидорова',
          customer_phone: '+7999654321',
          start_date: '2024-12-25',
          end_date: '2024-12-27',
          total_price: 7500,
          status: 'confirmed',
          ai_context: { source: 'avito_chat' },
          created_at: '2024-12-15T14:15:00Z'
        }
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading auto bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: 'confirmed' | 'rejected') => {
    try {
      // API вызов для обновления статуса
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Ожидает</Badge>;
      case 'confirmed':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Подтверждено</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Отклонено</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Автоматические бронирования
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Автоматических бронирований пока нет</p>
            <p className="text-sm">AI ассистент будет создавать их автоматически из чатов</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Даты</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.customer_phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(booking.start_date).toLocaleDateString('ru-RU')} - {' '}
                        {new Date(booking.end_date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{booking.total_price.toLocaleString()} ₽</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell>
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Подтвердить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'rejected')}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};