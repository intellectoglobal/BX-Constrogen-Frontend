import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/slab/'

export interface Slab {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "itemtyp_key":any
  "descr": any
  "items" : any[]
}


export const slabApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSlab: build.query<ListResponse<Slab>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.SLAB, key })),
        { type: tags.SLAB, id: 'LIST' },
      ] : [{ type: tags.SLAB, id: 'LIST' }],
    }),
    addSlab: build.mutation<Slab, Partial<Slab>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.SLAB, id: 'LIST' }],
    }),
    getSlab: build.query<Slab, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Slab, _err, id) => [{ type: tags.SLAB, id }],
    }),
    updateSlab: build.mutation<Slab, Partial<Slab>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (rod) => [{ type: tags.SLAB, id: rod?.key }],
    }),
    deleteSlab: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (rod) => [{ type: tags.SLAB, id: rod?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddSlabMutation,
  useDeleteSlabMutation,
  useGetSlabQuery,
  useListSlabQuery,
  useUpdateSlabMutation,
  useGetErrorProneQuery,
} = slabApi
