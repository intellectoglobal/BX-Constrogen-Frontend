import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/item_type/'

export interface ItemTypes {
  id: string
  key: number
  descr: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const itemTypesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listItemTypes: build.query<ListResponse<ItemTypes>, any>({
      query: ({ page, size, type }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&type=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_ITEMTYPE, id })),
        { type: tags.INVENTORY_ITEMTYPE, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_ITEMTYPE, id: 'LIST' }],
    }),
    addItemTypes: build.mutation<ItemTypes, Partial<ItemTypes>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_ITEMTYPE, id: 'LIST' }],
    }),
    getItemTypes: build.query<ItemTypes, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ItemTypes, _err, id) => [{ type: tags.INVENTORY_ITEMTYPE, id }],
    }),
    updateItemTypes: build.mutation<ItemTypes, Partial<ItemTypes>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_ITEMTYPE, id: project?.id }],
    }),
    deleteItemTypes: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_ITEMTYPE, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddItemTypesMutation,
  useDeleteItemTypesMutation,
  useGetItemTypesQuery,
  useListItemTypesQuery,
  useUpdateItemTypesMutation,
  useGetErrorProneQuery
} = itemTypesApi

export const {
  endpoints: { getItemTypes },
} = itemTypesApi
