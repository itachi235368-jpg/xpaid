import React from 'react';
import { FartPayLogo } from './FartPayLogo';

interface XpaidLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'square' | 'rounded' | 'flat' | 'badge' | 'mark';
}

export const XpaidLogo: React.FC<XpaidLogoProps> = ({
  className = 'w-9 h-9',
  showText = false,
  textColor,
  variant = 'badge',
}) => {
  return (
    <FartPayLogo 
      className={className} 
      showText={showText} 
      textColor={textColor}
      variant={variant === 'mark' ? 'mark' : 'badge'} 
    />
  );
};
