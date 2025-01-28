import React, { useState, useEffect } from 'react';
import { useOrbis } from "@orbisclub/components";
import { LoadingCircle } from "./Icons";
import UserCredential from './UserCredential';

export default function UserCredentials({ details }) {
  const { orbis } = useOrbis();
  const [credentials, setCredentials] = useState([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, [details?.did]);

  async function loadCredentials() {
    setCredentialsLoading(true);
    try {
      let { data } = await orbis.api.rpc("get_verifiable_credentials", {
        q_subject: details.did,
        q_min_weight: 10
      });
      setCredentials(data || []);
    } catch (error) {
      console.error("Error loading credentials:", error);
    } finally {
      setCredentialsLoading(false);
    }
  }

  if (credentialsLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingCircle />
      </div>
    );
  }

  if (!credentials?.length) {
    return (
      <div className="text-sm text-gray-500">
        No credentials yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {credentials.map((credential, index) => (
        <UserCredential 
          key={index} 
          credential={credential} 
          showTooltip={true} 
        />
      ))}
    </div>
  );
}
