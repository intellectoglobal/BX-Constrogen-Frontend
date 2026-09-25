import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/uom/type/'

export interface UOMTypes {
  id: string
  key: number
  descr: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const uomTypesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listUOMTypes: build.query<ListResponse<UOMTypes>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_UOMTYPE, id })),
        { type: tags.INVENTORY_UOMTYPE, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_UOMTYPE, id: 'LIST' }],
    }),
    addUOMTypes: build.mutation<UOMTypes, Partial<UOMTypes>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_UOMTYPE, id: 'LIST' }],
    }),
    getUOMTypes: build.query<UOMTypes, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_UOMTypes, _err, id) => [{ type: tags.INVENTORY_UOMTYPE, id }],
    }),
    updateUOMTypes: build.mutation<UOMTypes, Partial<UOMTypes>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_UOMTYPE, id: project?.id }],
    }),
    deleteUOMTypes: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_UOMTYPE, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddUOMTypesMutation,
  useDeleteUOMTypesMutation,
  useGetUOMTypesQuery,
  useListUOMTypesQuery,
  useUpdateUOMTypesMutation,
  useGetErrorProneQuery
} = uomTypesApi

export const {
  endpoints: { getUOMTypes },
} = uomTypesApi
