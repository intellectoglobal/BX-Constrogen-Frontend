import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/payment/'

export interface ContractorPayment {
  key : any;
  docid: any;
  number: any;
  date: any;
  loctyp: any;
  delivnotes: any;
  docstatus: any;
  purtmpl_key: any;
  vend_key: any;
  proj_key: any;
  wh_key: any;
  chqdate: any;
  paidamt: any;
  refnumber: any;
  allocatedamt: any;
  modeofpay: any;
  invoice_list: any[];
  payment_allocations : ContractorPaymentItem[]
}

export interface ContractorPaymentItem {
  invoicedate? :any
  invoiceno? : any
  invoicetotal? : any
  stilldue? : any
  amtallocated? : any
  apply? :any
  status? : any
  vendinv_key? : any
}

export interface ContractorPaymentItemPost {
  pay_key: number,
  payment_allocations: ContractorPaymentItem[];
}

export const contractorPaymentApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractorPayment: build.query<ContractorPayment[], any>({
      query: ({ page, size, project, paymentfrom, paymentto }) => {
        return {
          url: urlUtils(API_PATH, `?vendor_type=contractor&page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${project}&paymentfrom=${paymentfrom}&paymentto=${paymentto}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: tags.CONTRACTOR_PAYMENT, key })),
        { type: tags.CONTRACTOR_PAYMENT, id: 'LIST' },
      ] : [{ type: tags.CONTRACTOR_PAYMENT, id: 'LIST' }],
    }),
    addContractorPayment: build.mutation<ContractorPayment, Partial<ContractorPayment>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CONTRACTOR_PAYMENT, id: 'LIST' }],
    }),
    getContractorPayment: build.query<ContractorPayment, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractorPayment, _err, id) => [{ type: tags.CONTRACTOR_PAYMENT, id }],
    }),
    updateContractorPayment: build.mutation<ContractorPayment, Partial<ContractorPayment>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.CONTRACTOR_PAYMENT, id: payment?.key }],
    }),
    updatePaymentAllocation: build.mutation<any, Partial<ContractorPaymentItemPost>>({
      query(data) {
        const { ...body } = data
        return {
          url: `${API_PATH}allocation/`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.CONTRACTOR_PAYMENT, id: payment?.key }],
    }),
    deleteContractorPayment: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: tags.CONTRACTOR_PAYMENT, id: payment?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractorPaymentMutation,
  useDeleteContractorPaymentMutation,
  useGetContractorPaymentQuery,
  useListContractorPaymentQuery,
  useUpdateContractorPaymentMutation,
  useUpdatePaymentAllocationMutation,
  useGetErrorProneQuery,
} = contractorPaymentApi