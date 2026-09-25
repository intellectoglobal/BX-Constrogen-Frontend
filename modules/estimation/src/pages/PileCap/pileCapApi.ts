import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/pilecap/'

export interface PileCap {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const pileCapApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPileCap: build.query<ListResponse<PileCap>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.PILE_CAP, key })),
        { type: tags.PILE_CAP, id: 'LIST' },
      ] : [{ type: tags.PILE_CAP, id: 'LIST' }],
    }),
    addPileCap: build.mutation<PileCap, Partial<PileCap>>({
      query: (data) => ({
        url: API_PATH,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tags.PILE_CAP, id: 'LIST' }],
    }),
    getPileCap: build.query<PileCap, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PileCap, _err, id) => [{ type: tags.PILE_CAP, id }],
    }),
    updatePileCap: build.mutation<PileCap, Partial<PileCap>>({
      query(data) {
        return {
          url: `${API_PATH}`,
          method: 'POST',
          data,
        }
      },
      invalidatesTags: (data) => [{ type: tags.PILE_CAP, id: data?.key }],
    }),
    deletePileCap: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.PILE_CAP, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPileCapMutation,
  useDeletePileCapMutation,
  useGetPileCapQuery,
  useListPileCapQuery,
  useUpdatePileCapMutation,
  useGetErrorProneQuery,
} = pileCapApi
