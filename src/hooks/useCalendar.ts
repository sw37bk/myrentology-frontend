import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { bookingsApi } from '../services/bookings';
import type { CalendarEvent, Booking } from '../types';

export const useCalendar = () => {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: bookingsApi.getCalendarEvents,
  });

  const createMutation = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      message.success('Бронирование создано');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsModalOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      message.error(`Ошибка при создании бронирования: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Booking> }) => 
      bookingsApi.update(id, data),
    onSuccess: () => {
      message.success('Бронирование обновлено');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsModalOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      message.error(`Ошибка при обновлении бронирования: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookingsApi.delete,
    onSuccess: () => {
      message.success('Бронирование удалено');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsModalOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      message.error(`Ошибка при удалении бронирования: ${error.message}`);
    },
  });

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    const newEvent: CalendarEvent = {
      id: 0,
      title: 'Новое бронирование',
      start,
      end,
      resource: {
        id: 0,
        product: { id: 0, name: '', price: 0, is_active: true, created_at: '' },
        customer_name: '',
        customer_phone: '',
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: 'pending',
      } as Booking,
    };
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }: { event: any; start: Date; end: Date }) => {
    updateMutation.mutate({
      id: event.id,
      data: {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      },
    });
  }, [updateMutation]);

  const handleSubmit = useCallback((values: any) => {
    if (selectedEvent?.id && selectedEvent.id > 0) {
      updateMutation.mutate({
        id: selectedEvent.id,
        data: {
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          start_date: values.start_date,
          end_date: values.end_date,
          status: values.status,
        },
      });
    } else {
      createMutation.mutate({
        product_id: values.product_id,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        start_date: values.start_date,
        end_date: values.end_date,
        status: values.status,
      });
    }
  }, [selectedEvent, createMutation, updateMutation]);

  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return {
    events,
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    selectedEvent,
    isModalOpen,
    setIsModalOpen,
    setSelectedEvent,
    handleSelectSlot,
    handleSelectEvent,
    handleEventDrop,
    handleSubmit,
    handleDelete,
  };
};