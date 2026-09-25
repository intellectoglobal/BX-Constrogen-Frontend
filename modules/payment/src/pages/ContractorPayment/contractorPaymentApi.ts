import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/contract/payment/'

export interface ContractorPayment {
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
  wh_key: any
  chqdate: any
  paidamt: any
  refnumber: any
  allocatedamt: any
  modeofpay?:any
  contractor: any,
  invoice_list :any[]
  payment_allocations: any[]
}

interface ContractorPaymentPaginated {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContractorPayment[];
}

export interface Contractor {
  id: string
  key: number
  descr: string;
  invoice_list?: any[]
  lastmodifiedby?: any
  lastmodifieddttm?: any
  type?: any
}

interface ContractorPaymentInvoice {
  key: number;
  project_name: string;
  invoiceid: string;
  invoicedate: string;
  invoice_amount: string; // API returns string like "192422.48"
  pending_amount: number;
  contractor_details: {
    key: number;
    name: string;
    type: string | null;
  };
  allocated_amount: number | null;
  allocated_amount_details: any | null; // Replace 'any' with a specific type if details are known
  netamt: string; // API returns string like "227059.00"
}

// Define the paginated response interface
interface ContractorInvoice {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContractorPaymentInvoice[];
}


export const contractorPaymentApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractorPayment: build.query<ContractorPaymentPaginated, { page: number; size: number; year?: number; month?: number }>({
      query: ({ page, size, year, month }) => {
        let url = urlUtils(API_PATH, `all?page=${page}&page_size=${size || PAGE_SIZE}&pay_contractor=1`);
        if (year) url += `&year=${year}`;
        if (month) url += `&month=${month}`;
        return { url };
      },
      providesTags: (result) => result ? [
        ...result.results.map(({ key }) => ({ type: "CONTACTOR_PAYMENT", key })),
        { type: "CONTACTOR_PAYMENT", id: 'LIST' },
      ] : [{ type: "CONTACTOR_PAYMENT", id: 'LIST' }],
    }),
    listContractorPaymentInvoice: build.query<ContractorInvoice, { page: number; size: number; year?: number; month?: number }>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `all?page=${page}&page_size=${size || PAGE_SIZE}&pay_invoice=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result.results?.map(({ key }) => ({ type: "CONTACTOR_PAYMENT_INVOICE", key })),
        { type: "CONTACTOR_PAYMENT_INVOICE", id: 'LIST' },
      ] : [{ type: "CONTACTOR_PAYMENT_INVOICE", id: 'LIST' }],
    }),
    listContractorPaymentVoucher: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "CONTACTOR_PAYMENT_VOUCHER", key })),
        { type: "CONTACTOR_PAYMENT_VOUCHER", id: 'LIST' },
      ] : [{ type: "CONTACTOR_PAYMENT_VOUCHER", id: 'LIST' }],
    }),
    getInvoicesByContractor: build.query<any[], any>({
      query: ({ contractor }) => {
        return {
          url: urlUtils("/contract/inv_alloc_amt/", `?contractor_id=${contractor}&without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: "GetInvoicesByContractor", key })),
        { type: "GetInvoicesByContractor", id: 'LIST' },
      ] : [{ type: "GetInvoicesByContractor", id: 'LIST' }],
    }),
    allocateInvoiceAmountForContractor: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `/contract/inv_alloc_amt/1`,
          method: 'PUT',
          body,
        }
      },
    }),
    listBank: build.query<Array<any>, void>({
      query: () => {
        return {
          url: `/client/bank/?without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: "BANK", key })),
        { type: "BANK", id: 'LIST' },
      ] : [{ type: "BANK", id: 'LIST' }],
    }),
    addContractorPayment: build.mutation<ContractorPayment, Partial<ContractorPayment>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_PAYMENT, id: 'LIST' }],
    }),
    getContractorPayment: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractorPayment, _err, id) => [{ type: "CONTRACTOR_PAYMENT", id }],
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
      invalidatesTags: (payment) => [{ type: tags.VENDOR_PAYMENT, id: payment?.key }],
    }),
    updatePaymentAllocation: build.mutation<any, Partial<any>>({
      query(data) {
        const { ...body } = data
        return {
          url: `${API_PATH}allocation/`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.VENDOR_PAYMENT, id: payment?.key }],
    }),
    deleteContractorPayment: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: tags.VENDOR_PAYMENT, id: payment?.id }],
    }),
    getContractor: build.query<Contractor, number>({
      query: (id) => `/contract/contractor/${id}`,
      providesTags: (_Contractor, _err, id) => [{ type: tags.VENDOR, id }],
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
  useListContractorPaymentInvoiceQuery,
  useAllocateInvoiceAmountForContractorMutation,
  useListContractorPaymentVoucherQuery,
  useUpdateContractorPaymentMutation,
  useUpdatePaymentAllocationMutation,
  useGetContractorQuery,
  useGetInvoicesByContractorQuery,
  useListBankQuery,
  useGetErrorProneQuery,
} = contractorPaymentApi