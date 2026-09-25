import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/order/items/'

export interface TransactionItem {
  key: number,
  createddttm: string;
  qty: number;
  qtyrecd: number;
  itemnotes: string;
  unitorice: number;
  netamt: number;
  taxant: number;
  totalamt: number;
  createdby: string;
  lastmodifiedby: string;
  lastmodifieddttm: string;
  po_key: number;
  item_key: number;
  itemuom_key: number;
}

export interface TransactionItemPost {
  purchase_order_id: number,
  items: TransactionItem[];
}

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listTransactionItem: build.query<ListResponse<TransactionItem>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ item_key }) => ({ type: tags.TRANSACTION_ITEM, item_key })),
        { type: tags.TRANSACTION_ITEM, id: 'LIST' },
      ] : [{ type: tags.TRANSACTION_ITEM, id: 'LIST' }],
    }),
    addTransactionItems: build.mutation<TransactionItemPost, Partial<TransactionItemPost>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.TRANSACTION_ITEM, id: 'LIST' },{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    getTransactionItem: build.query<TransactionItem, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_TransactionItem, _err, id) => [{ type: tags.TRANSACTION_ITEM, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddTransactionItemsMutation,
  useGetTransactionItemQuery,
  useListTransactionItemQuery,
  useGetErrorProneQuery
} = vendorApi

export const {
  endpoints: { getTransactionItem },
} = vendorApi
