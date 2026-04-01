import si from 'systeminformation';
import { generateMachineCode } from '../../shared/key-format';

let cachedMachineCode: string | null = null;

export async function getMachineCode(): Promise<string> {
  if (cachedMachineCode) return cachedMachineCode;

  const [cpu, system, network] = await Promise.all([
    si.cpu(),
    si.system(),
    si.networkInterfaces(),
  ]);

  const cpuId = cpu.brand + cpu.manufacturer + cpu.cores;
  const motherboardSerial = system.serial || system.uuid || 'unknown';

  const interfaces = Array.isArray(network) ? network : [network];
  const macAddress = interfaces.find(
    (iface: any) => !iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00'
  )?.mac || 'unknown';

  cachedMachineCode = generateMachineCode(cpuId, motherboardSerial, macAddress);
  return cachedMachineCode;
}
