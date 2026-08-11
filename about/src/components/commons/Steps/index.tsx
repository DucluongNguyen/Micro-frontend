// src/components/commons/Steps.tsx
import React from 'react';
import { Steps } from 'antd';

export interface StepItem {
  title: string;
  description?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

interface CommonStepsProps {
  current: number;
  steps: StepItem[];
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
}

const CommonSteps: React.FC<CommonStepsProps> = ({
  current,
  steps,
  direction = 'horizontal',
  size = 'default',
}) => {
  return (
    <Steps current={current} direction={direction} size={size} items={steps} />
  );
};

export default CommonSteps;
