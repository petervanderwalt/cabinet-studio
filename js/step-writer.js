import { requestCad } from './cad-client.js?v=20261103s';

export async function downloadCabinetStep(panels, name) {
  const blob = await requestCad('step',panels);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(name || 'Cabinet').replace(/[^a-z0-9_-]/gi, '_')}.step`;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
