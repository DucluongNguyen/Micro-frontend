import { InputNumber } from 'antd';
import { FC } from 'react';

export const CustomInputNumberFormater: FC<any> = (props) => {
  return (
    <InputNumber<number>
      style={{ width: '100%' }}
      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, ''))}
      {...props}
    />
  );
};
