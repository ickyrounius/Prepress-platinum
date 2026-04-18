import { create } from 'zustand';

import { JopData, JosData } from '@/features/job/jobTypes';

type AnyFormData = Partial<JopData & JosData> & Record<string, unknown>;

interface FormState {
  currentForm: string | null;
  operatorId: string | null;
  formData: AnyFormData;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setOperatorId: (id: string) => void;
  setFormData: (data: AnyFormData) => void;
  updateFormField: (key: string, value: unknown) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  resetForm: () => void;
}

export const useFormStore = create<FormState>((set) => ({
  currentForm: null,
  operatorId: null,
  formData: {},
  isLoading: false,
  error: null,

  setOperatorId: (id) => set({ operatorId: id }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  updateFormField: (key, value) => 
    set((state) => ({ formData: { ...state.formData, [key]: value } })),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  resetForm: () => set({ formData: {}, error: null, isLoading: false }),
}));
