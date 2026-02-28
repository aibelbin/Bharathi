"use client";

import { useState } from "react";
import { CallerForm } from "./CallerForm";
import { TalkToAgent } from "./TalkToAgent";

interface CallPageClientProps {
  companyId: string;
  route: string;
  baseHeaders: Record<string, string>;
}

export function CallPageClient({
  companyId,
  route,
  baseHeaders,
}: CallPageClientProps) {
  const [userId, setUserId] = useState<string | null>(null);

  if (!userId) {
    return (
      <CallerForm
        companyId={companyId}
        onRegistered={(id) => setUserId(id)}
      />
    );
  }

  // Once registered, show the TalkToAgent component with the userId in headers
  const headers = {
    ...baseHeaders,
    "user-id": userId,
  };

  return (
    <div>
      <TalkToAgent route={route} headers={headers} />
    </div>
  );
}
