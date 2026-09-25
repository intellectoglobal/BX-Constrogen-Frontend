import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/generictank/'

export interface GenericTank {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const genericTankApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listGenericTank: build.query<ListResponse<GenericTank>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.GENERIC_TANK, key })),
        { type: tags.GENERIC_TANK, id: 'LIST' },
      ] : [{ type: tags.GENERIC_TANK, id: 'LIST' }],
    }),
    addGenericTank: build.mutation<GenericTank, Partial<GenericTank>>({
      query: (data) => ({
        url: API_PATH,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tags.GENERIC_TANK, id: 'LIST' }],
    }),
    getGenericTank: build.query<GenericTank, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_GenericTank, _err, id) => [{ type: tags.GENERIC_TANK, id }],
    }),
    updateGenericTank: build.mutation<GenericTank, Partial<GenericTank>>({
      query(data) {
        return {
          url: `${API_PATH}`,
          method: 'POST',
          data,
        }
      },
      invalidatesTags: (data) => [{ type: tags.GENERIC_TANK, id: data?.key }],
    }),
    deleteGenericTank: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.GENERIC_TANK, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddGenericTankMutation,
  useDeleteGenericTankMutation,
  useGetGenericTankQuery,
  useListGenericTankQuery,
  useUpdateGenericTankMutation,
  useGetErrorProneQuery,
} = genericTankApi
