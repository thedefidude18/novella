import React, { useEffect, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function TimeAgoWrapper({ date, ...props }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <ReactTimeAgo date={date} {...props} />;
}