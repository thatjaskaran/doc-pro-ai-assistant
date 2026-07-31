'use client';

import { useState } from 'react';

interface AppointmentFilterProps {
  children: (query: string) => React.ReactNode;
}

export function AppointmentFilter({ children }: AppointmentFilterProps) {
  const [query, setQuery] = useState('');

  return (
    <div>
      <input
        type="search"
        placeholder="Filter by doctor or specialty…"
        aria-label="Filter appointments"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {children(query)}
    </div>
  );
}