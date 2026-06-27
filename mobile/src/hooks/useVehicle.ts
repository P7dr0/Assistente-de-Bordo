import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { Vehicle, DashboardResponse, ServiceRecord } from '../services/api';

interface UseVehicleReturn {
  // State
  vehicle: Vehicle | null;
  dashboard: DashboardResponse | null;
  serviceHistory: ServiceRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadVehicle: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  loadServiceHistory: () => Promise<void>;
  updateOdometer: (value: number) => Promise<void>;
  registerService: (serviceType: string, odometer?: number, notes?: string) => Promise<void>;
  createVehicle: (data: {
    name: string;
    brand?: string;
    model?: string;
    year?: number;
    current_odometer?: number;
  }) => Promise<Vehicle>;
  refresh: () => Promise<void>;
}

export function useVehicle(vehicleId?: number): UseVehicleReturn {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVehicle = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const { vehicle: v } = await api.getVehicle(vehicleId);
      setVehicle(v);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [vehicleId]);

  const loadDashboard = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setIsLoading(true);
      const data = await api.getDashboard(vehicleId);
      setDashboard(data);
      setVehicle(data.vehicle);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId]);

  const loadServiceHistory = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const { records } = await api.listServiceRecords(vehicleId);
      setServiceHistory(records);
    } catch (err: any) {
      setError(err.message);
    }
  }, [vehicleId]);

  const updateOdometer = useCallback(
    async (value: number) => {
      if (!vehicleId) return;
      try {
        setIsLoading(true);
        await api.updateOdometer(vehicleId, value);
        await loadDashboard();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [vehicleId, loadDashboard]
  );

  const registerService = useCallback(
    async (serviceType: string, odometer?: number, notes?: string) => {
      if (!vehicleId) return;
      try {
        setIsLoading(true);
        await api.createServiceRecord(vehicleId, {
          service_type: serviceType,
          odometer_at_service: odometer,
          notes,
        });
        await loadDashboard();
        await loadServiceHistory();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [vehicleId, loadDashboard, loadServiceHistory]
  );

  const createVehicle = useCallback(
    async (data: {
      name: string;
      brand?: string;
      model?: string;
      year?: number;
      current_odometer?: number;
    }): Promise<Vehicle> => {
      try {
        setIsLoading(true);
        const { vehicle: newVehicle } = await api.createVehicle(data);
        setVehicle(newVehicle);
        setError(null);
        return newVehicle;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    await loadDashboard();
    await loadServiceHistory();
  }, [loadDashboard, loadServiceHistory]);

  // Carregar dados iniciais quando o vehicleId mudar
  useEffect(() => {
    if (vehicleId) {
      loadDashboard();
      loadServiceHistory();
    }
  }, [vehicleId, loadDashboard, loadServiceHistory]);

  return {
    vehicle,
    dashboard,
    serviceHistory,
    isLoading,
    error,
    loadVehicle,
    loadDashboard,
    loadServiceHistory,
    updateOdometer,
    registerService,
    createVehicle,
    refresh,
  };
}
