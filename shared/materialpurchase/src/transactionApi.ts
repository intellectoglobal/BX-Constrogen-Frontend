import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQueryWithGRN, ListResponse, SaveResponse } from '@igblsln/model';
import { TransactionItem } from './transactionItemApi';

const API_PATH = '/transaction/goods/receipts/'
const DOC_API_PATH = '/transaction/doc/id/'

export interface Transaction {
  key: number;
  createddttm: string;
  purchase_template: string;
  vendor: {
    key: number;
    id: string;
    name: string;
  },
  project: {
    key: number;
    id: string;
    name: string;
  },
  grn_items: TransactionItem[];
  docid: string;
  number: string;
  date: string;
  loctyp: string;
  delivnotes: string;
  docstatus: any;
  submitteddttm: string;
  submittedby: string;
  cancelleddttm: string;
  cancelledby: string;
  createdby: string;
  lastmodifiedby: string;
  lastmodifieddttm: string;
  purtmpl_key: string;
  vend_key: number;
  proj_key: string;
  wh_key: string;
}

interface NextDocId {
  next_doc_id: number
}

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listTransaction: build.query<ListResponse<Transaction>, PagingQueryWithGRN>({
      query: ({ page, size, grn }) => {
        return {
          url: grn ?
            urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&docid=${grn}`) :
            urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`)
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.TRANSACTION, key })),
        { type: tags.TRANSACTION, id: 'LIST' },
      ] : [{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    addTransaction: build.mutation<SaveResponse<Transaction>, Partial<Transaction>>({
      query: (body) => ({
        url: `${API_PATH}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    getTransaction: build.query<Transaction, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Transaction, _err, id) => [{ type: tags.TRANSACTION, id }],
    }),
    getTransactionNextDocId: build.query<NextDocId, string>({
      query: (id) => `${DOC_API_PATH}next?docid=${id}`,
      providesTags: (_Transaction, _err) => [],
    }),
    updateTransaction: build.mutation<SaveResponse<Transaction>, Partial<Transaction>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (data) => [{ type: tags.TRANSACTION, id: data?.data?.key }]
    }),
    deleteTransaction: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.TRANSACTION, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionQuery,
  useListTransactionQuery,
  useUpdateTransactionMutation,
  useGetErrorProneQuery,
  useGetTransactionNextDocIdQuery
} = vendorApi

export const {
  endpoints: { getTransaction },
} = vendorApi
