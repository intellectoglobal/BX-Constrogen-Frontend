import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type LeadFormState = {
  leadFormData: any | null;
  selectedLocationPreference: any[] | null;
}

const slice = createSlice({
  name: 'leadForm',
  initialState: { leadFormData: null, selectedLocationPreference: null } as LeadFormState,
  reducers: {
    setLeadFormData: (
      state,
      { payload }: PayloadAction<any>
    ) => {
      state.leadFormData = payload.leadFormData;
      state.selectedLocationPreference = payload.selectedLocationPreference;
    },
    clearLeadFormData: (state) => {
      state.leadFormData = null;
      state.selectedLocationPreference = null;
    }
  },
})

export const { setLeadFormData, clearLeadFormData } = slice.actions

export default slice.reducer

export const selectLeadFormData = (state: RootState) => state.leadForm.leadFormData
export const selectSelectedLocationPreference = (state: RootState) => state.leadForm.selectedLocationPreference
