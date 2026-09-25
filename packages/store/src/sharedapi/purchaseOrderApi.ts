import { api } from '../service';
import { PAGE_SIZE, tags } from '../constants';
import { urlUtils } from '../util';
import { PagingQuery, ListResponse, ListAllResponse, ModalBase } from '@igblsln/model';

const API_PATH = '/transaction/purchase/'
// const API_PATH = '/vendor/vendor/'

export interface PurchaseOrder extends ModalBase {
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const purchaseOrderApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    purchaseOrderForInvoice: build.query<ModalBase[], {vendor : any, project:any}>({
      query: ({vendor,project}) => {
        return {
          url: `${API_PATH}order/?vendor=${vendor}&project=${project}`,
        };
      },
      transformResponse:(baseQueryReturnValue:ModalBase[], meta, arg) => {
        baseQueryReturnValue = baseQueryReturnValue.map(d =>{
          return{
            ...d,
            key : d.key.toString()
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result.map(({ id }: ModalBase) => ({ type: tags.PURCHASE_ORDER_FOR_INVOICE, id })),
        { type: tags.PURCHASE_ORDER_FOR_INVOICE, id: 'LIST' },
      ] : [{ type: tags.PURCHASE_ORDER_FOR_INVOICE, id: 'LIST' }],
    }),
    purchaseTemplateItemsForId: build.query<any[], {id:number | null}>({
      query: ({id}) => {
        return {
          url: `/transaction/purchase/template/items/?p_template_id=${id}`,
        };
      },
      providesTags: (result) => result ? [
        ...result.map(({ key }: any) => ({ type: tags.PURCHASE_TEMPLATE_ITEMS_FOR_TEMPLATE_ID, key })),
        { type: tags.PURCHASE_TEMPLATE_ITEMS_FOR_TEMPLATE_ID, id: 'LIST' },
      ] : [{ type: tags.PURCHASE_TEMPLATE_ITEMS_FOR_TEMPLATE_ID, id: 'LIST' }],
    }),
    materialReceivedItemsForPO: build.query<any[], {id:number | null}>({
      query: ({id}) => {
        return {
          url: `/transaction/purchase/order/items/?p_order_id=${id}`,
        };
      },
      providesTags: (result) => result ? [
        ...result.map(({ key }: any) => ({ type: tags.MATERIAL_RECEIVED_ITEMS_FOR_PO, key })),
        { type: tags.MATERIAL_RECEIVED_ITEMS_FOR_PO, id: 'LIST' },
      ] : [{ type: tags.MATERIAL_RECEIVED_ITEMS_FOR_PO, id: 'LIST' }],
    }),
    invoiceItemsForGRN: build.query<any[], {id:number | null}>({
      query: ({id}) => {
        return {
          url: `/transaction/goods/receipts/item?grn_key=${id}`,
        };
      },
      providesTags: (result) => result ? [
        ...result.map(({ key }: any) => ({ type: tags.INVOICE_ITEMS_FOR_GRN, key })),
        { type: tags.INVOICE_ITEMS_FOR_GRN, id: 'LIST' },
      ] : [{ type: tags.INVOICE_ITEMS_FOR_GRN, id: 'LIST' }],
    }),
  }),
})

export const {
  usePurchaseOrderForInvoiceQuery,
  usePurchaseTemplateItemsForIdQuery,
  useMaterialReceivedItemsForPOQuery,
  useInvoiceItemsForGRNQuery
} = purchaseOrderApi
