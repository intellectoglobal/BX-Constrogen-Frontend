import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/templates/contract_service/'


export const endpointApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listServiceTemplate: build.query<ListResponse<any>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "ServiceTemplate", id })),
        { type: "ServiceTemplate", id: 'LIST' },
      ] : [{ type: "ServiceTemplate", id: 'LIST' }],
    }),
    addServiceTemplate: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "ServiceTemplate", id: 'LIST' }],
    }),
    getServiceTemplate: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ServiceTemplate, _err, id) => [{ type: "ServiceTemplate", id }],
    }),
    updateServiceTemplate: build.mutation<any, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "ServiceTemplate", id: project?.id }],
    }),
    deleteServiceTemplate: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "ServiceTemplate", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddServiceTemplateMutation,
  useDeleteServiceTemplateMutation,
  useGetServiceTemplateQuery,
  useListServiceTemplateQuery,
  useUpdateServiceTemplateMutation,
  useGetErrorProneQuery
} = endpointApi

