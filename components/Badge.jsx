import React from 'react';

export default function Badge({ children, style, tooltip }) {
  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={style}
      title={tooltip}
    >
      {children}
    </div>
  );
}
