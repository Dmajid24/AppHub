export const SERVER_STATUSES = ['Online', 'Warning', 'Critical', 'Offline', 'Maintenance', 'Unknown'];
const summaryKeys = { Online: 'healthy', Warning: 'warning', Critical: 'critical', Offline: 'offline', Maintenance: 'maintenance', Unknown: 'unknown' };
export const normalizeStatus = (status) => SERVER_STATUSES.includes(status) ? status : 'Unknown';

export function summarizeStatuses(servers) {
  const counts = Object.fromEntries(SERVER_STATUSES.map(status => [status, 0]));
  for (const server of servers) counts[normalizeStatus(server.status)] += 1;
  return counts;
}

export function buildInfrastructureSnapshot(data) {
  if (!data || !Array.isArray(data.dataCenters) || data.dataCenters.some(dc =>
    !dc.id || !Array.isArray(dc.servers) || dc.servers.some(s => !s.serverId || !Array.isArray(s.applications)))) {
    throw new Error('Format respons infrastruktur tidak valid.');
  }
  const locations = data.dataCenters.map(dc => {
    const counts = summarizeStatuses(dc.servers);
    const status = !dc.servers.length ? 'Unknown'
      : counts.Critical || counts.Offline ? 'Critical'
      : counts.Warning ? 'Warning' : counts.Unknown ? 'Unknown'
      : counts.Maintenance ? 'Maintenance' : 'Healthy';
    return { ...dc, totalServers: dc.servers.length, status,
      summary: Object.fromEntries(SERVER_STATUSES.map(key => [summaryKeys[key], counts[key]])) };
  });
  const servers = locations.flatMap(dc => dc.servers.map(s => ({ ...s,
    status: normalizeStatus(s.status), dataCenterId: dc.id, dataCenterName: dc.name, city: dc.city })));
  return { locations, servers, retrievedAt: data.retrievedAt };
}

// Null/invalid readings must not be treated as zero; a real zero remains valid.
export function averageMetric(servers, field, max = Infinity) {
  const values = servers.map(s => s[field]).filter(v =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max);
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
}

export function filterServers(servers, { cityKey = null, dcId = null, status = '', search = '' } = {}) {
  const query = search.trim().toLowerCase();
  return servers.filter(s => (!dcId || s.dataCenterId === dcId)
    && (!cityKey || String(s.city ?? '').trim().replace(/\s+/g, ' ').toLowerCase() === cityKey)
    && (!status || s.status === status)
    && [s.hostname, s.deviceIpAddress, s.serverName, s.dataCenterName, ...s.applications.map(a => a.name)]
      .join(' ').toLowerCase().includes(query));
}
