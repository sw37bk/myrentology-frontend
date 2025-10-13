import React from 'react';
import { Card, Empty } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

export const ProductsPage: React.FC = () => {
  return (
    <Card title={<><ShopOutlined /> Мои товары</>}>
      <Empty description="Управление товарами будет реализовано в следующем этапе" />
    </Card>
  );
};