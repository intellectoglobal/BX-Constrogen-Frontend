import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse, PagingQueryWithProject, ModalBase } from '@igblsln/model';

const API_PATH = '/contract/contract_agrmnt/'

export interface ContractAgreement {
  key: number;
  createddttm: string;
  agreement_no: string;
  contractAgreement: {
    key: number;
    id: string;
    name: string;
  },
  project: {
    key: number;
    id: string;
    name: string;
  },
  service_descriptions: any[];
  payment_schedules: any[];
  invoice_details: any[];
  payment_details: any[];
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
  project_id: string;
  contractor: any;
}


export const contractAgreementApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractAgreement: build.query<ListResponse<ContractAgreement>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results.map(({ key }) => ({ type: "CONTARCT_AGREEMENT", key })),
        { type: "CONTARCT_AGREEMENT", id: 'LIST' },
      ] : [{ type: "CONTARCT_AGREEMENT", id: 'LIST' }],
    }),
    addContractAgreement: build.mutation<SaveResponse<ContractAgreement>, Partial<ContractAgreement>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "CONTARCT_AGREEMENT", id: 'LIST' }],
    }),
    getContractAgreement: build.query<ContractAgreement, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractAgreement, _err, id) => [{ type: "CONTARCT_AGREEMENT", id }],
    }),
    getTransactionsForAgreement: build.query<any, number>({
      query: (id) => `/contract/payment/?agreement_id=${id}&without_pagination=1`,
    }),
    getInvoicesForAgreement: build.query<any, any>({
      query: ({agreement,project}) => `/contract/contractor_invoice/all?agreement_id=${agreement}&project_id=${project}&without_pagination=1`,
    }),
    updateContractAgreement: build.mutation<SaveResponse<ContractAgreement>, Partial<ContractAgreement>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: [{ type: "CONTARCT_AGREEMENT", id: 'LIST' }],
    }),
    deleteContractAgreement: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "CONTARCT_AGREEMENT", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
    getCSTemplatesForContractType: build.query<any[], any>({
      query: ({ cType }) => {
        return {
          url: `/templates/contract_service/?contract_type=${cType}`,
        };
      }
    }),
    getPSTemplatesForContractType: build.query<any[], any>({
      query: ({ cType }) => {
        return {
          url: `/templates/payment_schedule/?contract_type=${cType}`,
        };
      }
    }),
  }),
})

export const {
  useAddContractAgreementMutation,
  useDeleteContractAgreementMutation,
  useGetContractAgreementQuery,
  useListContractAgreementQuery,
  useUpdateContractAgreementMutation,
  useGetTransactionsForAgreementQuery,
  useGetInvoicesForAgreementQuery,
  useGetCSTemplatesForContractTypeQuery,
  useGetPSTemplatesForContractTypeQuery,
  useGetErrorProneQuery
} = contractAgreementApi

