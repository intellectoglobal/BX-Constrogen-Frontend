import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/floors/'

export interface Floor {
  key: number
  descr: string;
}

export const floorsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listFloors: build.query<Floor[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_FLOOR, id: key })),
        { type: tags.CRM_FLOOR, id: 'LIST' },
      ] : [{ type: tags.CRM_FLOOR, id: 'LIST' }],
    }),
    addFloor: build.mutation<Floor, Partial<Floor>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_FLOOR, id: 'LIST' }],
    }),
    getFloor: build.query<Floor, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_Floor, _err, key) => [{ type: tags.CRM_FLOOR, id: key }],
    }),
    updateFloor: build.mutation<Floor, Partial<Floor>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (floor) => [
        { type: tags.CRM_FLOOR, id: floor?.key },
        { type: tags.CRM_FLOOR, id: 'LIST' }
      ],
    }),
    deleteFloor: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (floor) => [
        { type: tags.CRM_FLOOR, id: floor?.key },
        { type: tags.CRM_FLOOR, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddFloorMutation,
  useDeleteFloorMutation,
  useGetFloorQuery,
  useListFloorsQuery,
  useUpdateFloorMutation,
} = floorsApi

export const {
  endpoints: { getFloor },
} = floorsApi
