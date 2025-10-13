import React from 'react';
import { Button, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/ru';

moment.locale('ru');

const { Text } = Typography;

interface CalendarToolbarProps {
  date: Date;
  view: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: string) => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  date,
  view,
  onNavigate,
  onView,
}) => {
  const getDateLabel = () => {
    switch (view) {
      case 'month':
        return moment(date).format('MMMM YYYY');
      case 'week':
        const start = moment(date).startOf('isoWeek');
        const end = moment(date).endOf('isoWeek');
        return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
      case 'day':
        return moment(date).format('DD MMMM YYYY, dddd');
      default:
        return moment(date).format('MMMM YYYY');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 16,
      padding: '0 8px'
    }}>
      <Space>
        <Button 
          icon={<LeftOutlined />} 
          onClick={() => onNavigate('PREV')}
        />
        <Button onClick={() => onNavigate('TODAY')}>
          Сегодня
        </Button>
        <Button 
          icon={<RightOutlined />} 
          onClick={() => onNavigate('NEXT')}
        />
      </Space>

      <Text strong style={{ fontSize: 18 }}>
        {getDateLabel()}
      </Text>

      <Space>
        <Button 
          type={view === 'month' ? 'primary' : 'default'}
          onClick={() => onView('month')}
        >
          Месяц
        </Button>
        <Button 
          type={view === 'week' ? 'primary' : 'default'}
          onClick={() => onView('week')}
        >
          Неделя
        </Button>
        <Button 
          type={view === 'day' ? 'primary' : 'default'}
          onClick={() => onView('day')}
        >
          День
        </Button>
      </Space>
    </div>
  );
};