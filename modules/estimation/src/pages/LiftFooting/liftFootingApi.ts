import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/liftfooting/'

export interface LiftFooting {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const liftFootingApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listLiftFooting: build.query<ListResponse<LiftFooting>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.LIFT_FOOTING, key })),
        { type: tags.LIFT_FOOTING, id: 'LIST' },
      ] : [{ type: tags.LIFT_FOOTING, id: 'LIST' }],
    }),
    addLiftFooting: build.mutation<LiftFooting, Partial<LiftFooting>>({
      query: (data) => ({
        url: API_PATH,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tags.LIFT_FOOTING, id: 'LIST' }],
    }),
    getLiftFooting: build.query<LiftFooting, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_LiftFooting, _err, id) => [{ type: tags.LIFT_FOOTING, id }],
    }),
    updateLiftFooting: build.mutation<LiftFooting, Partial<LiftFooting>>({
      query(data) {
        return {
          url: `${API_PATH}`,
          method: 'POST',
          data,
        }
      },
      invalidatesTags: (data) => [{ type: tags.LIFT_FOOTING, id: data?.key }],
    }),
    deleteLiftFooting: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.LIFT_FOOTING, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddLiftFootingMutation,
  useDeleteLiftFootingMutation,
  useGetLiftFootingQuery,
  useListLiftFootingQuery,
  useUpdateLiftFootingMutation,
  useGetErrorProneQuery,
} = liftFootingApi
