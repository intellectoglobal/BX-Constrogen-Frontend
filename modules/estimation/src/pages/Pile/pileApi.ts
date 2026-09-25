import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/pile/'

export interface Pile {
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


export const pileApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPile: build.query<ListResponse<Pile>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.PILE, key })),
        { type: tags.PILE, id: 'LIST' },
      ] : [{ type: tags.PILE, id: 'LIST' }],
    }),
    addPile: build.mutation<Pile, Partial<Pile>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PILE, id: 'LIST' }],
    }),
    getPile: build.query<Pile, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Pile, _err, id) => [{ type: tags.PILE, id }],
    }),
    updatePile: build.mutation<Pile, Partial<Pile>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (rod) => [{ type: tags.PILE, id: rod?.key }],
    }),
    deletePile: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (rod) => [{ type: tags.PILE, id: rod?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPileMutation,
  useDeletePileMutation,
  useGetPileQuery,
  useListPileQuery,
  useUpdatePileMutation,
  useGetErrorProneQuery,
} = pileApi
