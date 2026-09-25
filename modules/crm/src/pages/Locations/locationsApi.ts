import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/locations/'

export interface Location {
  key: number
  descr: string;
}

export const locationsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listLocations: build.query<Location[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_LOCATION, id: key })),
        { type: tags.CRM_LOCATION, id: 'LIST' },
      ] : [{ type: tags.CRM_LOCATION, id: 'LIST' }],
    }),
    addLocation: build.mutation<Location, Partial<Location>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_LOCATION, id: 'LIST' }],
    }),
    getLocation: build.query<Location, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_Location, _err, key) => [{ type: tags.CRM_LOCATION, id: key }],
    }),
    updateLocation: build.mutation<Location, Partial<Location>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (location) => [
        { type: tags.CRM_LOCATION, id: location?.key },
        { type: tags.CRM_LOCATION, id: 'LIST' }
      ],
    }),
    deleteLocation: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (location) => [
        { type: tags.CRM_LOCATION, id: location?.key },
        { type: tags.CRM_LOCATION, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddLocationMutation,
  useDeleteLocationMutation,
  useGetLocationQuery,
  useListLocationsQuery,
  useUpdateLocationMutation,
} = locationsApi
