import React from 'react';
import { Typography } from 'antd';

const { Link } = Typography;

type CommonTextLinkProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const TextLink: React.FC<CommonTextLinkProps> = ({
  children,
  onClick,
  className = '',
}) => {
  return (
    <Link onClick={onClick} className={className} style={{ padding: 0 }}>
      {children}
    </Link>
  );
};

export default TextLink;
