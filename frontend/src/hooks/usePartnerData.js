import { useState, useEffect, useCallback } from 'react';
import { getPartnersSummary } from '../lib/api.js';
import { useWebSocket } from './useWebSocket.js';

export function usePartnerData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: summary, source } = await getPartnersSummary();
      setData(summary);
      setDataSource(source);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // WebSocket updates
  const wsStatus = useWebSocket(useCallback(payload => {
    if (payload.type === 'DATA_UPDATE') {
      setData({
        partner1: payload.partner1,
        partner2: payload.partner2,
        jointStreakDays: payload.jointStreakDays ?? 0,
        lastUpdated: payload.timestamp,
        dataSource: payload.dataSource,
      });
      setDataSource(payload.dataSource ?? 'unknown');
      setLastUpdated(new Date());
    }
  }, []));

  return { data, loading, error, dataSource, lastUpdated, wsStatus, refetch: fetchData };
}
