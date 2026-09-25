import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQueryWithProject, ListResponse } from '@igblsln/model';

const API_PATH = '/project/history/price/'

export interface PriceChange {
  id: any
  key: number
  effdate: any;
  effprice: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const priceChangeApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPriceChange: build.query<ListResponse<PriceChange>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PRICE_CHANGE, id })),
        { type: tags.PRICE_CHANGE, id: 'LIST' },
      ] : [{ type: tags.PRICE_CHANGE, id: 'LIST' }],
    }),
    addPriceChange: build.mutation<PriceChange, Partial<PriceChange>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PRICE_CHANGE, id: 'LIST' }],
    }),
    getPriceChange: build.query<PriceChange, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PriceChange, _err, id) => [{ type: tags.PRICE_CHANGE, id }],
    }),
    updatePriceChange: build.mutation<PriceChange, Partial<PriceChange>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (price) => [{ type: tags.PRICE_CHANGE, id: price?.id }],
    }),
    deletePriceChange: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (price) => [{ type: tags.PRICE_CHANGE, id: price?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPriceChangeMutation,
  useDeletePriceChangeMutation,
  useGetPriceChangeQuery,
  useListPriceChangeQuery,
  useUpdatePriceChangeMutation,
  useGetErrorProneQuery,
} = priceChangeApi

export const {
  endpoints: { getPriceChange },
} = priceChangeApi
