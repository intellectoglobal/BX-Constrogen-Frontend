import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse } from '@igblsln/model';
import { ContractTask } from './contractTasksApi';
import { ContractStage } from './contractStageApi';

const API_PATH = '/contract/contractor/'

export interface Contract {
  key: number;
  createddttm: string;
  purchase_template: string;
  contract: {
    key: number;
    id: string;
    name: string;
  },
  project: {
    key: number;
    id: string;
    name: string;
  },
  vend_contract_tasks: ContractTask[];
  vend_contract_stages: ContractStage[];
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


export const contractApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContract: build.query<ListResponse<Contract>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results.map(({ key }) => ({ type: tags.CONTRACT, key })),
        { type: tags.CONTRACT, id: 'LIST' },
      ] : [{ type: tags.CONTRACT, id: 'LIST' }],
    }),
    addContract: build.mutation<SaveResponse<Contract>, Partial<Contract>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CONTRACT, id: 'LIST' }],
    }),
    getContract: build.query<Contract, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Contract, _err, id) => [{ type: tags.CONTRACT, id }],
    }),
    updateContract: build.mutation<SaveResponse<Contract>, Partial<Contract>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: [{ type: tags.CONTRACT, id: 'LIST' }],
    }),
    deleteContract: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.CONTRACT, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractMutation,
  useDeleteContractMutation,
  useGetContractQuery,
  useListContractQuery,
  useUpdateContractMutation,
  useGetErrorProneQuery
} = contractApi

export const {
  endpoints: { getContract },
} = contractApi
