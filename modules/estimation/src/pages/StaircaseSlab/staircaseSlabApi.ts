import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/staircaseslab/'

export interface StaircaseSlab {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const staircaseSlabApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listStaircaseSlab: build.query<ListResponse<StaircaseSlab>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.STAIRCASE_SLAB, key })),
        { type: tags.STAIRCASE_SLAB, id: 'LIST' },
      ] : [{ type: tags.STAIRCASE_SLAB, id: 'LIST' }],
    }),
    addStaircaseSlab: build.mutation<StaircaseSlab, Partial<StaircaseSlab>>({
      query: (data) => ({
        url: API_PATH,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tags.STAIRCASE_SLAB, id: 'LIST' }],
    }),
    getStaircaseSlab: build.query<StaircaseSlab, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_StaircaseSlab, _err, id) => [{ type: tags.STAIRCASE_SLAB, id }],
    }),
    updateStaircaseSlab: build.mutation<StaircaseSlab, Partial<StaircaseSlab>>({
      query(data) {
        return {
          url: `${API_PATH}`,
          method: 'POST',
          data,
        }
      },
      invalidatesTags: (data) => [{ type: tags.STAIRCASE_SLAB, id: data?.key }],
    }),
    deleteStaircaseSlab: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.STAIRCASE_SLAB, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddStaircaseSlabMutation,
  useDeleteStaircaseSlabMutation,
  useGetStaircaseSlabQuery,
  useListStaircaseSlabQuery,
  useUpdateStaircaseSlabMutation,
  useGetErrorProneQuery,
} = staircaseSlabApi
