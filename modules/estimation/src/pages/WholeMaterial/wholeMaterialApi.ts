import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/whole/material/'

export interface WholeMaterial {
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


export const wholeMaterialApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listWholeMaterial: build.query<ListResponse<WholeMaterial>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.WHOLE_MATERIAL_PACK, key })),
        { type: tags.WHOLE_MATERIAL_PACK, id: 'LIST' },
      ] : [{ type: tags.WHOLE_MATERIAL_PACK, id: 'LIST' }],
    }),
    addWholeMaterial: build.mutation<WholeMaterial, Partial<WholeMaterial>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.WHOLE_MATERIAL_PACK, id: 'LIST' }],
    }),
    getWholeMaterial: build.query<WholeMaterial, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_WholeMaterial, _err, id) => [{ type: tags.WHOLE_MATERIAL_PACK, id }],
    }),
    updateWholeMaterial: build.mutation<WholeMaterial, Partial<WholeMaterial>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (material) => [{ type: tags.WHOLE_MATERIAL_PACK, id: material?.key }],
    }),
    deleteWholeMaterial: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (material) => [{ type: tags.WHOLE_MATERIAL_PACK, id: material?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddWholeMaterialMutation,
  useDeleteWholeMaterialMutation,
  useGetWholeMaterialQuery,
  useListWholeMaterialQuery,
  useUpdateWholeMaterialMutation,
  useGetErrorProneQuery,
} = wholeMaterialApi
