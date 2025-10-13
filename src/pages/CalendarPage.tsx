import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

type View = 'month' | 'week' | 'day' | 'agenda';
import { Card, Spin, Button, Space } from 'antd';
import { CalendarOutlined, LeftOutlined, RightOutlined, CalendarTwoTone } from '@ant-design/icons';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendar } from '../hooks/useCalendar';
import { BookingModal } from '../components/BookingModal';
import type { CalendarEvent } from '../types';

moment.locale('ru', {
  months: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
  monthsShort: 'янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек'.split('_'),
  weekdays: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
  weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
});

const localizer = momentLocalizer(moment);

const messages = {
  today: 'Сегодня',
  previous: '‹',
  next: '›',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  agenda: 'Повестка',
  date: 'Дата',
  time: 'Время',
  event: 'Событие',
  noEventsInRange: 'Нет событий в выбранном диапазоне',
  showMore: (total: number) => `+${total} еще`,
  allDay: 'Весь день',
  work_week: 'Рабочая неделя',
  yesterday: 'Вчера',
  tomorrow: 'Завтра'
};

const formats = {
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd DD MMMM',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
    return `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`;
  },
};

export const CalendarPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const {
    events,
    isLoading,
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
  } = useCalendar();

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const CustomToolbar = () => {
    const formattedDate = currentView === 'month' 
      ? moment(currentDate).format('MMMM YYYY')
      : currentView === 'week'
      ? `${moment(currentDate).startOf('week').format('D MMM')} - ${moment(currentDate).endOf('week').format('D MMM YYYY')}`
      : moment(currentDate).format('D MMMM YYYY');

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        padding: '8px 16px',
        background: '#fafafa',
        border: '1px solid #d9d9d9',
        borderRadius: '6px'
      }}>
        <Space>
          <Button 
            icon={<LeftOutlined />} 
            onClick={goToPrevious}
            size="small"
          />
          <Button 
            icon={<RightOutlined />} 
            onClick={goToNext}
            size="small"
          />
          <Button onClick={goToToday} size="small">
            Сегодня
          </Button>
        </Space>

        <span style={{ 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          <CalendarTwoTone twoToneColor="#1890ff" style={{ marginRight: 8 }} />
          {formattedDate}
        </span>

        <Space>
          <Button 
            type={currentView === 'month' ? 'primary' : 'default'}
            onClick={() => setCurrentView('month')}
            size="small"
          >
            Месяц
          </Button>
          <Button 
            type={currentView === 'week' ? 'primary' : 'default'}
            onClick={() => setCurrentView('week')}
            size="small"
          >
            Неделя
          </Button>
          <Button 
            type={currentView === 'day' ? 'primary' : 'default'}
            onClick={() => setCurrentView('day')}
            size="small"
          >
            День
          </Button>
        </Space>
      </div>
    );
  };

  const eventPropGetter = (event: CalendarEvent) => {
    const status = event.resource?.status;
    
    const styleMap = {
      pending: { backgroundColor: '#faad14', borderColor: '#faad14' },
      confirmed: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
      cancelled: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' },
      completed: { backgroundColor: '#1890ff', borderColor: '#1890ff' },
    };

    return {
      style: styleMap[status as keyof typeof styleMap] || { 
        backgroundColor: '#faad14', 
        borderColor: '#faad14' 
      },
    };
  };

  if (error) {
    return (
      <Card title={<><CalendarOutlined /> Календарь бронирований</>}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Ошибка загрузки данных
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        title={<><CalendarOutlined /> Календарь бронирований</>}
        extra={
          <Button 
            type="primary" 
            onClick={() => {
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
          >
            Новое бронирование
          </Button>
        }
      >
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <CustomToolbar />
            <div style={{ height: '70vh' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                view={currentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                onView={setCurrentView}
                selectable
                popup
                eventPropGetter={eventPropGetter}
                messages={messages}
                step={30}
                timeslots={2}
                showMultiDayTimes
                min={new Date(2024, 0, 1, 8, 0)}
                max={new Date(2024, 0, 1, 22, 0)}
              />
            </div>
          </>
        )}
      </Card>

      <BookingModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
};