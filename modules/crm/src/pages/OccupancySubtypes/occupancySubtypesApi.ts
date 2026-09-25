import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/leads/occupancysubtypes/'

export interface OccupancySubtype {
  key: number
  descr: string;
}

export const occupancySubtypesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listOccupancySubtypes: build.query<OccupancySubtype[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_OCCUPANCY_SUBTYPE, id: key })),
        { type: tags.CRM_OCCUPANCY_SUBTYPE, id: 'LIST' },
      ] : [{ type: tags.CRM_OCCUPANCY_SUBTYPE, id: 'LIST' }],
    }),
    addOccupancySubtypes: build.mutation<OccupancySubtype, Partial<OccupancySubtype>>({
      query: (body) => ({ url: API_PATH, method: 'POST', body }),
      invalidatesTags: [{ type: tags.CRM_OCCUPANCY_SUBTYPE, id: 'LIST' }],
    }),
    getOccupancySubtypes: build.query<OccupancySubtype, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_OccupancySubtype, _err, key) => [{ type: tags.CRM_OCCUPANCY_SUBTYPE, id: key }],
    }),
    updateOccupancySubtypes: build.mutation<OccupancySubtype, Partial<OccupancySubtype>>({
      query(data) { const { key, ...body } = data; return { url: `${API_PATH}${key}`, method: 'PUT', body } },
      invalidatesTags: (occupancySubtype) => [
        { type: tags.CRM_OCCUPANCY_SUBTYPE, id: occupancySubtype?.key },
        { type: tags.CRM_OCCUPANCY_SUBTYPE, id: 'LIST' }
      ],
    }),
    deleteOccupancySubtypes: build.mutation<{ success: boolean; key: number }, number>({
      query(key) { return { url: `${API_PATH}${key}`, method: 'DELETE' } },
      invalidatesTags: (occupancySubtype) => [
        { type: tags.CRM_OCCUPANCY_SUBTYPE, id: occupancySubtype?.key },
        { type: tags.CRM_OCCUPANCY_SUBTYPE, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddOccupancySubtypesMutation,
  useDeleteOccupancySubtypesMutation,
  useGetOccupancySubtypesQuery,
  useListOccupancySubtypesQuery,
  useUpdateOccupancySubtypesMutation,
} = occupancySubtypesApi
