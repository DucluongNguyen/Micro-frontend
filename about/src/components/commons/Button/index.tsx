import React from 'react';
import { Button as ButtonAntd } from 'antd';
import type { ButtonProps } from 'antd';

export interface CommonButtonProps extends ButtonProps {
  text?: string;
}

const Button: React.FC<CommonButtonProps> = ({ text, children, type = 'primary', ...rest }) => {
  return (
    <ButtonAntd type={type} {...rest}>
      {text || children}
    </ButtonAntd>
  );
};

export default Button;
