import React from 'react';

interface DividerBlockProps {
  isActive: boolean;
  onFocus: () => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  onFocus,
}) => {
  return (
    <div 
      className="py-2 cursor-pointer" 
      onClick={onFocus}
      tabIndex={0}
      onFocus={onFocus}
    >
      <hr className="border-t-2 border-gray-200" />
    </div>
  );
};
