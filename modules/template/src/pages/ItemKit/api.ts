import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/templates/item_kit/'


export const endpointApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listItemKitTemplate: build.query<ListResponse<any>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "ItemKitTemplate", id })),
        { type: "ItemKitTemplate", id: 'LIST' },
      ] : [{ type: "ItemKitTemplate", id: 'LIST' }],
    }),
    addItemKitTemplate: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "ItemKitTemplate", id: 'LIST' }],
    }),
    getItemKitTemplate: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ItemKitTemplate, _err, id) => [{ type: "ItemKitTemplate", id }],
    }),
    updateItemKitTemplate: build.mutation<any, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "ItemKitTemplate", id: project?.id }],
    }),
    deleteItemKitTemplate: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "ItemKitTemplate", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddItemKitTemplateMutation,
  useDeleteItemKitTemplateMutation,
  useGetItemKitTemplateQuery,
  useListItemKitTemplateQuery,
  useUpdateItemKitTemplateMutation,
  useGetErrorProneQuery
} = endpointApi

