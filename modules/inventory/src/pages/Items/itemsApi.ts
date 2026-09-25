import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/item/'


export interface GridData {
  name: any
  key: number
  value: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const itemsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listItems: build.query<ListResponse<any>, any>({
      query: ({ page, size, type, subtype }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&item_type=${type}` : ''}${subtype ? `&item_sub_type=${subtype}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_ITEM, id })),
        { type: tags.INVENTORY_ITEM, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_ITEM, id: 'LIST' }],
    }),
    addItems: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_ITEM, id: 'LIST' }],
    }),
    getItems: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Items, _err, id) => [{ type: tags.INVENTORY_ITEM, id }],
    }),
    updateItems: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_ITEM, id: project?.id }],
    }),
    deleteItems: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_ITEM, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddItemsMutation,
  useDeleteItemsMutation,
  useGetItemsQuery,
  useListItemsQuery,
  useUpdateItemsMutation,
  useGetErrorProneQuery,
} = itemsApi

export const {
  endpoints: { getItems },
} = itemsApi
