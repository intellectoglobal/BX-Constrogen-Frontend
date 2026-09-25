import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse, ModalBase } from '@igblsln/model';

const API_PATH = '/contract/contractor_invoice/'

export interface ContractInvoice {
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
  apterm_days : any;
  invoicedate : any;
  invoice_items: any[];
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
  itemtype_key: any;
  invoice_amount: number;
  paid_amount: number;
  payable_amount: number;
}

export const contractInvoiceApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractInvoice: build.query<{ count: number, next: string | null, previous: string | null, results: ContractInvoice[], total_invoice_amount: number }, any>({
      query: ({ page, size, project, agreement, contractor, inhouse, cTypeId, from, to }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project_id=${project}` : ''}${agreement ? `&agreement_id=${agreement}` : ''}${contractor ? `&contractor_id=${contractor}` : ''}${cTypeId ? `&contractor_type_id=${cTypeId}` : ''}${inhouse ? `&inhouse=${inhouse}` : ''}${from ? `&from_date=${from}` : ''}${to ? `&to_date=${to}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.CONTRACT_INVOICE, key })),
        { type: tags.CONTRACT_INVOICE, id: 'LIST' },
      ] : [{ type: tags.CONTRACT_INVOICE, id: 'LIST' }],
    }),
    addContractorInvoice: build.mutation<SaveResponse<ContractInvoice>, Partial<ContractInvoice>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CONTRACT_INVOICE, id: 'LIST' }],
    }),
    getContractInvoice: build.query<ContractInvoice, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractInvoice, _err, id) => [{ type: tags.CONTRACT_INVOICE, id }],
    }),
    updateContractInvoice: build.mutation<SaveResponse<ContractInvoice>, Partial<ContractInvoice>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: [{ type: tags.CONTRACT_INVOICE, id: 'LIST' }],
    }),
    deleteContractInvoice: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.CONTRACT_INVOICE, id: project?.id }],
    }),
    getSubmittedContract: build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils(`contract/contractor/?only_submitted_contracts=True&without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: tags.CONTRACT_INVOICE, key })),
        { type: tags.CONTRACT, id: 'LIST' },
      ] : [{ type: tags.CONTRACT, id: 'LIST' }],
    }),

    contractorsForProjectAndCtype: build.query<any[], { projectId: any, cTypeId: any }>({
      query: ({ projectId, cTypeId }) => {
        return {
          url: `/contract/contractor_invoice/all?project_id=${projectId}&contractor_type_id=${cTypeId}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: "ContractorsForProjectAndCtype", id })),
        { type: "ContractorsForProjectAndCtype", id: 'LIST' },
      ] : [{ type: "ContractorsForProjectAndCtype", id: 'LIST' }],
    }),
    contractorAgreementsForParams: build.query<any[], { projectId: any, cTypeId: any, contractorId?: any }>({
      query: ({ projectId, cTypeId, contractorId }) => {
        return {
          url: `/contract/contractor_invoice/all?project_id=${projectId}&contractor_type_id=${cTypeId}&contractor_id=${contractorId || ''}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: "ContractorAgreementsForParams", id })),
        { type: "ContractorAgreementsForParams", id: 'LIST' },
      ] : [{ type: "ContractorAgreementsForParams", id: 'LIST' }],
    }),
    paymentSchedulesForAgreement: build.query<any[], { agreementId: any }>({
      query: ({ agreementId }) => {
        return {
          url: `/contract/contractor_invoice/all?agreement_id=${agreementId}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: "PaymentSchedulesForAgreement", id })),
        { type: "PaymentSchedulesForAgreement", id: 'LIST' },
      ] : [{ type: "PaymentSchedulesForAgreement", id: 'LIST' }],
    }),
    allPaymentSchedulesForAgreement: build.query<any[], { agreementId: any }>({
      query: ({ agreementId }) => {
        return {
          url: `/contract/contractor_invoice/all?agreement_id=${agreementId}&all_schedules=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: "PaymentSchedulesForAgreement", id })),
        { type: "PaymentSchedulesForAgreement", id: 'LIST' },
      ] : [{ type: "PaymentSchedulesForAgreement", id: 'LIST' }],
    }),

    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractorInvoiceMutation,
  useDeleteContractInvoiceMutation,
  useGetContractInvoiceQuery,
  useListContractInvoiceQuery,
  useUpdateContractInvoiceMutation,
  useGetSubmittedContractQuery,
  useGetErrorProneQuery,
  useContractorsForProjectAndCtypeQuery,
  useContractorAgreementsForParamsQuery,
  usePaymentSchedulesForAgreementQuery,
  useAllPaymentSchedulesForAgreementQuery
} = contractInvoiceApi

export const {
  endpoints: { getContractInvoice },
} = contractInvoiceApi
