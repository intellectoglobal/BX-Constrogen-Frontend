import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/construction/agreement/'



export interface DropDownData {
  key: any
  name?: any
  desc?: any
  id?: any
}


export const ConstructionAgreementApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listConstructionAgreement: build.query<ListResponse<any>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "ConstructionAgreement", key })),
        { type: "ConstructionAgreement", id: 'LIST' },
      ] : [{ type: "ConstructionAgreement", id: 'LIST' }],
    }),
    addConstructionAgreement: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "ConstructionAgreement", id: 'LIST' }],
    }),
    getConstructionAgreement: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ConstructionAgreement, _err, id) => [{ type: "ConstructionAgreement", id }],
    }),
    updateConstructionAgreement: build.mutation<any, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (order) => [{ type: "ConstructionAgreement", id: order?.key }],
    }),
    deleteConstructionAgreement: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (order) => [{ type: "ConstructionAgreement", id: order?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddConstructionAgreementMutation,
  useDeleteConstructionAgreementMutation,
  useGetConstructionAgreementQuery,
  useListConstructionAgreementQuery,
  useUpdateConstructionAgreementMutation,
  useGetErrorProneQuery,
} = ConstructionAgreementApi
