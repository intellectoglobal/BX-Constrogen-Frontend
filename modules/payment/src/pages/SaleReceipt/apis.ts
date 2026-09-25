import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse } from '@igblsln/model';

const API_PATH = "/sale/sale_receipt/"


export interface DropDownData {
  key: any
  name?: any
  desc?: any
  id?: any
}


export const purchaseOrderApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getSourceOfFunds: build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils("/sale/source_of_fund/?without_pagination=1"),
        };
      },
    }),
    listReceiveSaleInvoice: build.query<ListResponse<any>, any>({
      query: ({ page, size, project, unit }) => {
        return {
          url: urlUtils("/sale/payment/all?receivable_invoices=1", `&page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project_id=${project}` : ''}${unit ? `&unit_id=${unit}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "RECEIVE_SALE_INVOICE", key })),
        { type: "RECEIVE_SALE_INVOICE", id: 'LIST' },
      ] : [{ type: "RECEIVE_SALE_INVOICE", id: 'LIST' }],
    }),
    listSaleReceipt: build.query<ListResponse<any>, any>({
      query: ({ page, size, project, unit }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project_id=${project}` : ''}${unit ? `&unit_id=${unit}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "RECEIVE_SALE_INVOICE", key })),
        { type: "RECEIVE_SALE_INVOICE", id: 'LIST' },
      ] : [{ type: "RECEIVE_SALE_INVOICE", id: 'LIST' }],
    }),
    addReceiveSaleInvoice: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "RECEIVE_SALE_INVOICE", id: 'LIST' }],
    }),
    deleteSaleReceipt: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: "RECEIVE_SALE_INVOICE", id: payment?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetSourceOfFundsQuery,
  useListReceiveSaleInvoiceQuery,
  useListSaleReceiptQuery,
  useAddReceiveSaleInvoiceMutation,
  useDeleteSaleReceiptMutation,
  useGetErrorProneQuery,
} = purchaseOrderApi
