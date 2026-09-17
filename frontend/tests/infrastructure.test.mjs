import test from 'node:test';
import assert from 'node:assert/strict';
import { averageMetric, buildInfrastructureSnapshot, filterServers, summarizeStatuses } from '../src/services/infrastructureSummary.js';

const server = (id, status, extra = {}) => ({ serverId: id, hostname: id, status, applications: [], ...extra });
const dataCenter = (id, city, servers) => ({ id, city, name: id, latitude: 0, longitude: 100, servers });

test('map totals and table totals agree across empty DCs and every status', () => {
  const snapshot = buildInfrastructureSnapshot({ dataCenters: [
    dataCenter('dc1', 'Jakarta', [server('a', 'Online'), server('b', 'Warning'), server('c', 'Offline')]),
    dataCenter('dc2', 'Jakarta', [server('d', 'Maintenance'), server('e', 'unrecognized')]),
    dataCenter('dc3', 'Surabaya', []),
  ] });
  assert.equal(snapshot.locations.reduce((n, dc) => n + dc.totalServers, 0), snapshot.servers.length);
  assert.deepEqual(snapshot.locations.map(dc => dc.status), ['Critical', 'Unknown', 'Unknown']);
  assert.equal(snapshot.servers[4].status, 'Unknown');
  assert.equal(summarizeStatuses(snapshot.servers).Offline, 1);
  assert.equal(snapshot.locations[0].summary.healthy, 1);
});

test('empty database produces zero counts and unavailable metrics', () => {
  const snapshot = buildInfrastructureSnapshot({ dataCenters: [] });
  assert.equal(snapshot.servers.length, 0);
  assert.equal(averageMetric([], 'availability', 100), null);
  assert.equal(Object.values(summarizeStatuses([])).reduce((a, b) => a + b, 0), 0);
});

test('averages retain zero but exclude missing, nonnumeric, and invalid readings', () => {
  const values = [0, 100, null, undefined, NaN, -1, 101, '', '50'].map(availability => ({ availability }));
  assert.equal(averageMetric(values, 'availability', 100), 50);
  assert.equal(averageMetric([{ availability: null }], 'availability', 100), null);
});

test('location, status and application search combine without changing global totals', () => {
  const snapshot = buildInfrastructureSnapshot({ dataCenters: [
    dataCenter('dc1', ' Jakarta ', [server('a', 'Critical', { applications: [{ name: 'Finance' }] })]),
    dataCenter('dc2', 'Jakarta', [server('b', 'Online')]),
    dataCenter('dc3', 'Surabaya', [server('c', 'Critical')]),
  ] });
  assert.equal(filterServers(snapshot.servers, { cityKey: 'jakarta' }).length, 2);
  assert.equal(filterServers(snapshot.servers, { dcId: 'dc2' }).length, 1);
  assert.equal(filterServers(snapshot.servers, { cityKey: 'jakarta', status: 'Critical', search: 'FINANCE' })[0].serverId, 'a');
  assert.equal(filterServers(snapshot.servers, { status: 'Offline' }).length, 0);
  assert.equal(snapshot.servers.length, 3);
});

test('malformed API responses do not become a healthy empty dashboard', () => {
  for (const data of [null, {}, { dataCenters: [{}] }, { dataCenters: [dataCenter('dc', 'Jakarta', [{ serverId: 'a' }])] }]) {
    assert.throws(() => buildInfrastructureSnapshot(data), /Format respons/);
  }
});
