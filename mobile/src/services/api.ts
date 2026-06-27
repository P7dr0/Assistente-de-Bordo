import { API_BASE_URL } from '../constants/theme';

/**
 * Cliente HTTP para a API do Assistente de Bordo.
 * Usa fetch nativo do React Native.
 */

interface Vehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  current_odometer: number;
  created_at: string;
  updated_at: string;
}

interface MaintenanceItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  intervalKm: number;
  status: 'green' | 'yellow' | 'red';
  percentage: number;
  kmSinceService: number;
  kmRemaining: number;
  kmOverdue: number;
  lastServiceOdometer: number;
  lastServiceDate: string | null;
  needsAttention: boolean;
}

interface DashboardResponse {
  vehicle: Vehicle;
  healthScore: number;
  maintenanceItems: MaintenanceItem[];
  attentionItems: MaintenanceItem[];
  totalItems: number;
  itemsNeedingAttention: number;
}

interface ServiceRecord {
  id: number;
  vehicle_id: number;
  service_type: string;
  service_name: string;
  service_icon: string;
  odometer_at_service: number;
  notes: string;
  performed_at: string;
  created_at: string;
}

interface ServiceType {
  id: string;
  name: string;
  icon: string;
  intervalKm: number;
  description: string;
  category: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
    throw error;
  }
}

// ─── Vehicles ──────────────────────────────────────────────

export async function createVehicle(data: {
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  current_odometer?: number;
}): Promise<{ vehicle: Vehicle }> {
  return request('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listVehicles(): Promise<{ vehicles: Vehicle[] }> {
  return request('/vehicles');
}

export async function getVehicle(id: number): Promise<{ vehicle: Vehicle }> {
  return request(`/vehicles/${id}`);
}

export async function deleteVehicle(id: number): Promise<{ message: string }> {
  return request(`/vehicles/${id}`, { method: 'DELETE' });
}

// ─── Dashboard ──────────────────────────────────────────────

export async function getDashboard(vehicleId: number): Promise<DashboardResponse> {
  return request(`/vehicles/${vehicleId}/dashboard`);
}

// ─── Odometer ──────────────────────────────────────────────

export async function updateOdometer(
  vehicleId: number,
  odometerValue: number
): Promise<{ message: string; vehicle: Vehicle }> {
  return request(`/vehicles/${vehicleId}/odometer`, {
    method: 'PUT',
    body: JSON.stringify({ odometer_value: odometerValue }),
  });
}

// ─── Services ──────────────────────────────────────────────

export async function createServiceRecord(
  vehicleId: number,
  data: {
    service_type: string;
    odometer_at_service?: number;
    notes?: string;
  }
): Promise<{ message: string; record: ServiceRecord }> {
  return request(`/vehicles/${vehicleId}/services`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listServiceRecords(
  vehicleId: number,
  params?: { service_type?: string; limit?: number }
): Promise<{ records: ServiceRecord[] }> {
  let query = '';
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.service_type) searchParams.set('service_type', params.service_type);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    query = `?${searchParams.toString()}`;
  }
  return request(`/vehicles/${vehicleId}/services${query}`);
}

export async function deleteServiceRecord(
  vehicleId: number,
  serviceId: number
): Promise<{ message: string }> {
  return request(`/vehicles/${vehicleId}/services/${serviceId}`, {
    method: 'DELETE',
  });
}

export async function listServiceTypes(): Promise<{ serviceTypes: ServiceType[] }> {
  return request('/vehicles/service-types');
}

// ─── Export Types ──────────────────────────────────────────

export type {
  Vehicle,
  MaintenanceItem,
  DashboardResponse,
  ServiceRecord,
  ServiceType,
};
