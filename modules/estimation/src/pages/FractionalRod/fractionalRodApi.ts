import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/fractional/rod/'

export interface FractionalRod {
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


export const fractionalRodApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listFractionalRod: build.query<ListResponse<FractionalRod>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.FRACTIONAL_ROD_PACK, key })),
        { type: tags.FRACTIONAL_ROD_PACK, id: 'LIST' },
      ] : [{ type: tags.FRACTIONAL_ROD_PACK, id: 'LIST' }],
    }),
    addFractionalRod: build.mutation<FractionalRod, Partial<FractionalRod>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.FRACTIONAL_ROD_PACK, id: 'LIST' }],
    }),
    getFractionalRod: build.query<FractionalRod, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_FractionalRod, _err, id) => [{ type: tags.FRACTIONAL_ROD_PACK, id }],
    }),
    updateFractionalRod: build.mutation<FractionalRod, Partial<FractionalRod>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (rod) => [{ type: tags.FRACTIONAL_ROD_PACK, id: rod?.key }],
    }),
    deleteFractionalRod: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (rod) => [{ type: tags.FRACTIONAL_ROD_PACK, id: rod?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddFractionalRodMutation,
  useDeleteFractionalRodMutation,
  useGetFractionalRodQuery,
  useListFractionalRodQuery,
  useUpdateFractionalRodMutation,
  useGetErrorProneQuery,
} = fractionalRodApi
