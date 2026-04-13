import { query } from '../../config/database.js';
import type { Device, CreateDeviceRequest } from '@wareable/shared';

const SELECT_DEVICE = `SELECT id, user_id as "userId", platform, device_name as "deviceName",
  device_model as "deviceModel", last_synced_at as "lastSyncedAt",
  is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  FROM devices`;

export async function getDevices(userId: string): Promise<Device[]> {
  const result = await query<any>(`${SELECT_DEVICE} WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
  return result.rows;
}

export async function createDevice(userId: string, data: CreateDeviceRequest): Promise<Device> {
  const result = await query<any>(
    `INSERT INTO devices (user_id, platform, device_name, device_model)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id as "userId", platform, device_name as "deviceName",
       device_model as "deviceModel", last_synced_at as "lastSyncedAt",
       is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
    [userId, data.platform, data.deviceName || null, data.deviceModel || null]
  );
  return result.rows[0];
}

export async function updateDevice(userId: string, deviceId: string, data: { deviceName?: string; deviceModel?: string; isActive?: boolean }): Promise<Device | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.deviceName !== undefined) { sets.push(`device_name = $${idx++}`); values.push(data.deviceName); }
  if (data.deviceModel !== undefined) { sets.push(`device_model = $${idx++}`); values.push(data.deviceModel); }
  if (data.isActive !== undefined) { sets.push(`is_active = $${idx++}`); values.push(data.isActive); }
  sets.push(`updated_at = NOW()`);

  if (sets.length === 1) return null; // only updated_at

  values.push(deviceId, userId);
  const result = await query<any>(
    `UPDATE devices SET ${sets.join(', ')} WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING id, user_id as "userId", platform, device_name as "deviceName",
       device_model as "deviceModel", last_synced_at as "lastSyncedAt",
       is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteDevice(userId: string, deviceId: string): Promise<boolean> {
  const result = await query('DELETE FROM devices WHERE id = $1 AND user_id = $2', [deviceId, userId]);
  return (result.rowCount ?? 0) > 0;
}
