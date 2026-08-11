import React from 'react';
import { Tabs as TabsAntd } from 'antd';
import type { TabsProps } from 'antd';

export interface CommonTabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

interface CommonTabsProps {
  items: CommonTabItem[];
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  tabPosition?: TabsProps['tabPosition'];
  centered?: boolean;
  activeKey: string;
}

const Tabs: React.FC<CommonTabsProps> = ({
  items,
  defaultActiveKey,
  onChange,
  tabPosition = 'top',
  centered = false,
  activeKey,
}) => {
  return (
    <TabsAntd
      items={items}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
      tabPosition={tabPosition}
      centered={centered}
      activeKey={activeKey}
    />
  );
};

export default Tabs;
