import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/leads/occupancies/'

export interface Occupancy {
  key: number
  descr: string;
}

export const occupanciesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listOccupancies: build.query<Occupancy[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_OCCUPANCY, id: key })),
        { type: tags.CRM_OCCUPANCY, id: 'LIST' },
      ] : [{ type: tags.CRM_OCCUPANCY, id: 'LIST' }],
    }),
    addOccupancies: build.mutation<Occupancy, Partial<Occupancy>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_OCCUPANCY, id: 'LIST' }],
    }),
    getOccupancies: build.query<Occupancy, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_Occupancy, _err, key) => [{ type: tags.CRM_OCCUPANCY, id: key }],
    }),
    updateOccupancies: build.mutation<Occupancy, Partial<Occupancy>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (occupancy) => [
        { type: tags.CRM_OCCUPANCY, id: occupancy?.key },
        { type: tags.CRM_OCCUPANCY, id: 'LIST' }
      ],
    }),
    deleteOccupancies: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (occupancy) => [
        { type: tags.CRM_OCCUPANCY, id: occupancy?.key },
        { type: tags.CRM_OCCUPANCY, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddOccupanciesMutation,
  useDeleteOccupanciesMutation,
  useGetOccupanciesQuery,
  useListOccupanciesQuery,
  useUpdateOccupanciesMutation,
} = occupanciesApi
