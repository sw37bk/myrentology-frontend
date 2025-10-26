import React, { useState, useEffect } from 'react';
import { Modal, List, Button, message, Spin, Input, Space } from 'antd';
import { LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

interface AvitoAd {
  id: string;
  title: string;
  price: number;
  status: string;
  address: string;
  url: string;
  category: {
    id: number;
    name: string;
  };
}

interface AvitoAdSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (adId: string, adUrl: string) => void;
  resourceId: number;
}

export const AvitoAdSelector: React.FC<AvitoAdSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  resourceId
}) => {
  const { user } = useAuthStore();
  const [ads, setAds] = useState<AvitoAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAds();
    }
  }, [isOpen]);

  const loadAds = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/avito-ads?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAds(data.resources || []);
      } else {
        message.error('Ошибка загрузки объявлений');
      }
    } catch (error) {
      message.error('Ошибка загрузки объявлений');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (ad: AvitoAd) => {
    try {
      const response = await fetch('/api/link-resource-avito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          resource_id: resourceId,
          avito_ad_id: ad.id
        })
      });

      if (response.ok) {
        onSelect(ad.id, ad.url);
        onClose();
        message.success('Объявление привязано к ресурсу');
      } else {
        const error = await response.json();
        message.error(error.error || 'Ошибка привязки');
      }
    } catch (error) {
      message.error('Ошибка привязки объявления');
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.title.toLowerCase().includes(searchText.toLowerCase()) ||
    ad.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal
      title="Выберите объявление Авито"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Поиск по названию или адресу..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Spin spinning={loading}>
          <List
            dataSource={filteredAds}
            renderItem={(ad) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => handleSelect(ad)}
                  >
                    Привязать
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={ad.title}
                  description={
                    <div>
                      <div><strong>Цена:</strong> {ad.price.toLocaleString()} ₽</div>
                      <div><strong>Адрес:</strong> {ad.address}</div>
                      <div><strong>Категория:</strong> {ad.category.name}</div>
                      <div><strong>Статус:</strong> {ad.status}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>

        {!loading && filteredAds.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {ads.length === 0 ? 'Нет объявлений' : 'Ничего не найдено'}
          </div>
        )}
      </Space>
    </Modal>
  );
};