import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { FilterSettings, settingApi, SettingData } from './settingApi'
import type { ISettings } from './settingApi'
import { IAppState } from '../IAppState';

export interface SettingType {
  setting: ISettings;
  isDirty: boolean;
  isUpdateNeeded: boolean;
  isLoading: boolean;
  error: string;
}

const initialState = {
  setting: {
    settings: [],
    filters: {}
  },
  isDirty: false,
  isUpdateNeeded: false,
  isLoading: false,
  error: '',
} as SettingType

const slice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateFilter: (state, action: PayloadAction<FilterSettings>) => {
      state.setting.filters = action.payload;
    },
    updateGridSetting: (state, action: PayloadAction<{ gridId: string, value: any }>) => {
      state.setting.filters[action.payload.gridId] = action.payload.value;
      state.isDirty = true;
    },
    saveFilterSetting: (state) => {
      if (state.isDirty) {
        const settings = state.setting.settings
        const filterSetting = settings.find(x => x.option === 'filters');
        if (filterSetting) {
          state.setting.settings = [...settings.filter(x => x !== filterSetting),
          { ...filterSetting, value: JSON.stringify(state.setting.filters) }];
        } else {
          state.setting.settings = [...settings, { option: 'filters', value: JSON.stringify(state.setting.filters) }]
        }
        state.isDirty = false;
        state.isUpdateNeeded = true;
      }
    },
    changeUpdated: (state) => {
      state.isUpdateNeeded = false;
    }

  },
  extraReducers: (builder) => {
    builder
      .addMatcher(settingApi.endpoints.settings.matchPending, (state, action) => {
        state.isLoading = true;
      })
      .addMatcher(settingApi.endpoints.settings.matchFulfilled, (state, action) => {
        state.setting.settings = action.payload;
        const filter = action.payload.find(x => x.option === 'filters')
        if (filter?.value) {
          state.setting.filters = JSON.parse(filter.value);
        }

      })
      .addMatcher(settingApi.endpoints.settings.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '';
      })
  },
})

export const { updateFilter, updateGridSetting, saveFilterSetting, changeUpdated } = slice.actions
export default slice.reducer

export const selectSettingIsLoading = (state: IAppState) => state[slice.name].isLoading

export const selectSettingIsDirty = (state: IAppState) => state[slice.name].isDirty

export const selectIsUpdateNeeded = (state: IAppState) => state[slice.name].isUpdateNeeded

export const selectFilterData = (state: IAppState) => state[slice.name].setting.filters

export const selectSettingsData = (state: IAppState): SettingData[] => state[slice.name].setting.settings
