import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/order/'

export interface PurchaseOrder {
  key: any
  docid: any
  number: any
  date: any
  loctyp: any
  delivnotes: any
  docstatus: any
  purtmpl_key: any
  vend_key: any
  proj_key: any
  itemtyp_key: any
  wh_key: any
  purchs_odr_items: any
  invoice_no: any
  project?:any
  vendor?:any
  itemtype?:any
  purchase_template?:any
}


export interface DropDownData {
  key: any
  name?: any
  desc?: any
  id?: any
}


export const purchaseOrderApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPurchaseOrder: build.query<ListResponse<PurchaseOrder>, any>({
      query: ({ page, size, project, status }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project=${project}` : ''}${status ? `&status=${status}` : ''}`),
        };
      },
      transformResponse(baseQueryReturnValue: ListResponse<PurchaseOrder>, meta, arg) {
        baseQueryReturnValue['results'] = baseQueryReturnValue.results.map((d, index) => {
          return {
            ...d,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.PURCHASE_ORDER, key })),
        { type: tags.PURCHASE_ORDER, id: 'LIST' },
      ] : [{ type: tags.PURCHASE_ORDER, id: 'LIST' }],
    }),
    addPurchaseOrder: build.mutation<PurchaseOrder, Partial<PurchaseOrder>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PURCHASE_ORDER, id: 'LIST' }],
    }),
    getPurchaseOrder: build.query<PurchaseOrder, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PurchaseOrder, _err, id) => [{ type: tags.PURCHASE_ORDER, id }],
    }),
    updatePurchaseOrder: build.mutation<PurchaseOrder, Partial<PurchaseOrder>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (order) => [{ type: tags.PURCHASE_ORDER, id: order?.key }],
    }),
    deletePurchaseOrder: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (order) => [{ type: tags.PURCHASE_ORDER, id: order?.id }],
    }),
    addVendorInvoice: build.mutation<SaveResponse<any>, Partial<any>>({
      query: (body) => ({
        url: '/transaction/vendor/invoice/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_INVOICE, id: 'LIST' }],
    }),
    addContractInvoice: build.mutation<SaveResponse<any>, Partial<any>>({
      query: (body) => ({
        url: '/contract/invoice/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CONTRACT_INVOICE, id: 'LIST' }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useListPurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
  useAddVendorInvoiceMutation,
  useAddContractInvoiceMutation,
  useGetErrorProneQuery,
} = purchaseOrderApi
