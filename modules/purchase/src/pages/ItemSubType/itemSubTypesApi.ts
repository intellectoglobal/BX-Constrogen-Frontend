import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/item_subtype/'



export const itemSubTypesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listItemSubTypes: build.query<ListResponse<any>, PagingQuery>({
      query: ({ page, size, type }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&type=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_ITEM_SUB_TYPE, id })),
        { type: tags.INVENTORY_ITEM_SUB_TYPE, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_ITEM_SUB_TYPE, id: 'LIST' }],
    }),
    getAll: build.mutation<ListResponse<any>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      invalidatesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_ITEM_SUB_TYPE, id })),
        { type: tags.INVENTORY_ITEM_SUB_TYPE, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_ITEM_SUB_TYPE, id: 'LIST' }],
    }),
    addItemSubTypes: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_ITEM_SUB_TYPE, id: 'LIST' }],
    }),
    getItemSubTypes: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ItemSubTypes, _err, id) => [{ type: tags.INVENTORY_ITEM_SUB_TYPE, id }],
    }),
    updateItemSubTypes: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_ITEM_SUB_TYPE, id: project?.id }],
    }),
    deleteItemSubTypes: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_ITEM_SUB_TYPE, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddItemSubTypesMutation,
  useDeleteItemSubTypesMutation,
  useGetItemSubTypesQuery,
  useListItemSubTypesQuery,
  useUpdateItemSubTypesMutation,
  useGetErrorProneQuery,
  useGetAllMutation
} = itemSubTypesApi

export const {
  endpoints: { getItemSubTypes },
} = itemSubTypesApi
