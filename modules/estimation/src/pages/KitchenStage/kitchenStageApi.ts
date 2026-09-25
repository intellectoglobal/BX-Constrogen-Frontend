import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/kitchenstage/'

export interface KitchenStage {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const kitchenStageApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listKitchenStage: build.query<ListResponse<KitchenStage>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.KITCHEN_STAGE, key })),
        { type: tags.KITCHEN_STAGE, id: 'LIST' },
      ] : [{ type: tags.KITCHEN_STAGE, id: 'LIST' }],
    }),
    addKitchenStage: build.mutation<KitchenStage, Partial<KitchenStage>>({
      query: (data) => ({
        url: API_PATH,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tags.KITCHEN_STAGE, id: 'LIST' }],
    }),
    getKitchenStage: build.query<KitchenStage, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_KitchenStage, _err, id) => [{ type: tags.KITCHEN_STAGE, id }],
    }),
    updateKitchenStage: build.mutation<KitchenStage, Partial<KitchenStage>>({
      query(data) {
        return {
          url: `${API_PATH}`,
          method: 'POST',
          data,
        }
      },
      invalidatesTags: (data) => [{ type: tags.KITCHEN_STAGE, id: data?.key }],
    }),
    deleteKitchenStage: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.KITCHEN_STAGE, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddKitchenStageMutation,
  useDeleteKitchenStageMutation,
  useGetKitchenStageQuery,
  useListKitchenStageQuery,
  useUpdateKitchenStageMutation,
  useGetErrorProneQuery,
} = kitchenStageApi
