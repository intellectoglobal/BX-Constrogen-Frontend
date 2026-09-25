import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/fractional/material/'

export interface FractionalMaterial {
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


export const fractionalMaterialApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listFractionalMaterial: build.query<ListResponse<FractionalMaterial>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.FRACTIONAL_MATERIAL_PACK, key })),
        { type: tags.FRACTIONAL_MATERIAL_PACK, id: 'LIST' },
      ] : [{ type: tags.FRACTIONAL_MATERIAL_PACK, id: 'LIST' }],
    }),
    addFractionalMaterial: build.mutation<FractionalMaterial, Partial<FractionalMaterial>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.FRACTIONAL_MATERIAL_PACK, id: 'LIST' }],
    }),
    getFractionalMaterial: build.query<FractionalMaterial, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_FractionalMaterial, _err, id) => [{ type: tags.FRACTIONAL_MATERIAL_PACK, id }],
    }),
    updateFractionalMaterial: build.mutation<FractionalMaterial, Partial<FractionalMaterial>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (material) => [{ type: tags.FRACTIONAL_MATERIAL_PACK, id: material?.key }],
    }),
    deleteFractionalMaterial: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (material) => [{ type: tags.FRACTIONAL_MATERIAL_PACK, id: material?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddFractionalMaterialMutation,
  useDeleteFractionalMaterialMutation,
  useGetFractionalMaterialQuery,
  useListFractionalMaterialQuery,
  useUpdateFractionalMaterialMutation,
  useGetErrorProneQuery,
} = fractionalMaterialApi
