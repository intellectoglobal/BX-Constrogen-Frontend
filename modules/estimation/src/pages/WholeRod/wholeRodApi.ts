import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/whole/rod/'

export interface WholeRod {
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


export const wholeRodApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listWholeRod: build.query<ListResponse<WholeRod>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.WHOLE_ROD_PACK, key })),
        { type: tags.WHOLE_ROD_PACK, id: 'LIST' },
      ] : [{ type: tags.WHOLE_ROD_PACK, id: 'LIST' }],
    }),
    addWholeRod: build.mutation<WholeRod, Partial<WholeRod>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.WHOLE_ROD_PACK, id: 'LIST' }],
    }),
    getWholeRod: build.query<WholeRod, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_WholeRod, _err, id) => [{ type: tags.WHOLE_ROD_PACK, id }],
    }),
    updateWholeRod: build.mutation<WholeRod, Partial<WholeRod>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (rod) => [{ type: tags.WHOLE_ROD_PACK, id: rod?.key }],
    }),
    deleteWholeRod: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (rod) => [{ type: tags.WHOLE_ROD_PACK, id: rod?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddWholeRodMutation,
  useDeleteWholeRodMutation,
  useGetWholeRodQuery,
  useListWholeRodQuery,
  useUpdateWholeRodMutation,
  useGetErrorProneQuery,
} = wholeRodApi
