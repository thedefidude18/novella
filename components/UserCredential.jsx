import React from 'react';
import Badge from './Badge';

export default function UserCredential({ credential, showTooltip = true }) {
  if (!credential?.content) return null;

  return (
    <Badge
      style={{
        backgroundColor: '#f3f4f6',
        color: '#374151'
      }}
      tooltip={showTooltip ? credential.content.credentialSubject?.description : null}
    >
      {credential.content.credentialSubject?.name || 'Credential'}
    </Badge>
  );
}
