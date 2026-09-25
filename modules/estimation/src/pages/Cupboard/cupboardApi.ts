import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/cupboard/'

export interface Cupboard {
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


export const cupboardApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCupboard: build.query<ListResponse<Cupboard>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.CUPBOARD, key })),
        { type: tags.CUPBOARD, id: 'LIST' },
      ] : [{ type: tags.CUPBOARD, id: 'LIST' }],
    }),
    addCupboard: build.mutation<Cupboard, Partial<Cupboard>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CUPBOARD, id: 'LIST' }],
    }),
    getCupboard: build.query<Cupboard, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Cupboard, _err, id) => [{ type: tags.CUPBOARD, id }],
    }),
    updateCupboard: build.mutation<Cupboard, Partial<Cupboard>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (rod) => [{ type: tags.CUPBOARD, id: rod?.key }],
    }),
    deleteCupboard: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (rod) => [{ type: tags.CUPBOARD, id: rod?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCupboardMutation,
  useDeleteCupboardMutation,
  useGetCupboardQuery,
  useListCupboardQuery,
  useUpdateCupboardMutation,
  useGetErrorProneQuery,
} = cupboardApi
