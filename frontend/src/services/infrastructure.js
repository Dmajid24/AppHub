import { authFetch } from './api';

// Tabel server pada tab Tech Info aplikasi.
export async function fetchApplicationServers(applicationId) {
  if (!applicationId) {
    throw new Error('ID aplikasi belum tersedia');
  }

  const data = await authFetch(
    `/api/Applications/${encodeURIComponent(applicationId)}/servers`
  );

  if (!Array.isArray(data)) {
    throw new Error('Format respons daftar server aplikasi tidak valid');
  }

  return data;
}

// Marker dan ringkasan kesehatan Data Center.
// Endpoint ini khusus Admin.
export async function fetchDataCenterMap() {
  const data = await authFetch('/api/DataCenters/map');

  if (!Array.isArray(data)) {
    throw new Error('Format respons peta data center tidak valid');
  }

  return data;
}

// Daftar server beserta aplikasi yang menggunakan setiap server.
// Endpoint ini khusus Admin.
export async function fetchDataCenterServers(dataCenterId) {
  if (!dataCenterId) {
    throw new Error('ID data center belum tersedia');
  }

  const data = await authFetch(
    `/api/DataCenters/${encodeURIComponent(dataCenterId)}/servers`
  );

  if (!data || !Array.isArray(data.servers)) {
    throw new Error('Format respons server data center tidak valid');
  }

  return data;
}

// Detail satu server beserta aplikasi yang menggunakannya.
// Endpoint ini khusus Admin.
export async function fetchServerDetail(serverId) {
  if (!serverId) {
    throw new Error('ID server belum tersedia');
  }

  const data = await authFetch(
    `/api/Servers/${encodeURIComponent(serverId)}`
  );

  if (
    !data ||
    !data.serverId ||
    !Array.isArray(data.applications)
  ) {
    throw new Error('Format respons detail server tidak valid');
  }

  return data;
}

export async function fetchServerApplicationImpact(serverId) {
  if (!serverId) {
    throw new Error('ID server belum tersedia.');
  }

  const data = await authFetch(
    `/api/Servers/${encodeURIComponent(serverId)}/application-impact`
  );

  if (
    !data?.sourceServer?.serverId ||
    !Array.isArray(data.applications)
  ) {
    throw new Error('Format respons analisis dampak tidak valid.');
  }

  return data;
}