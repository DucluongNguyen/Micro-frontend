import React from 'react';
import { Timeline } from 'antd';
import type { TimelineProps } from 'antd';

export interface TimelineItem {
  title: string;
  content: React.ReactNode;
  time: string;
}

interface CommonTimelineProps {
  items: TimelineItem[];
  mode?: 'left' | 'right' | 'alternate';
  itemSpacing?: number;
}

const CommonTimeline: React.FC<CommonTimelineProps> = ({
  items,
  mode = 'left',
  itemSpacing = 36,
}) => {
  return (
    <Timeline
      mode={mode}
      items={items.map((item) => ({
        label: item.time,
        children: (
          <div style={{ paddingBottom: itemSpacing }}>{item.title}</div>
        ),
      }))}
    />
  );
};

export default CommonTimeline;
