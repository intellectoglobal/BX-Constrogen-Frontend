import { retry } from '@reduxjs/toolkit/query/react'
import tags from '../../constants/tags';
import { api } from '../../service/authApi'

const API_PATH = '/user/settings/'

export interface FilterSettings {
    [name: string]: any;
}

export interface SettingData {
    id?: number;
    option: string;
    user?: number;
    value: string;
}

export interface SettingsPost {
    username: string;
    settings: SettingData[];
}

export interface ISettings {
    settings: SettingData[],
    filters: FilterSettings
}

export const settingApi = api.injectEndpoints({
    endpoints: (build) => ({
        settings: build.query<SettingData[], string>({
            query: (user) => ({
                url: `${API_PATH}`,
                params: { username: user }
            }),

            providesTags: (_Transaction, _err, user) => [{ type: tags.SETTINGS, user }],

        }),
        saveSettings: build.mutation<SettingData[], Partial<SettingsPost>>({
            query: (body) => ({
                url: API_PATH,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: tags.SETTINGS, id: 'LIST' }],
        }),
    }),
})

export const {
    useSettingsQuery,
    useSaveSettingsMutation,
} = settingApi

export const {
    endpoints: { settings },
} = settingApi
