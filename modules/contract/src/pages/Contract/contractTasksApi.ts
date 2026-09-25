import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/order/items/'

export interface ContractTask {
  key: number,
  task : any;
  createddttm: string;
  netamt: number;
  createdby: string;
  lastmodifiedby: string;
  lastmodifieddttm: string;
  unitprice: number;
  qty: number;
  task_key: number;
}

export interface ContractTaskPost {
  purchase_order_id: number,
  items: ContractTask[];
}

export const contractTaskApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractTask: build.query<ListResponse<ContractTask>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ task_key }) => ({ type: tags.CONTRACT_TASK, task_key })),
        { type: tags.CONTRACT_TASK, id: 'LIST' },
      ] : [{ type: tags.CONTRACT_TASK, id: 'LIST' }],
    }),
    getContractTask: build.query<ContractTask, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractTask, _err, id) => [{ type: tags.CONTRACT_TASK, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetContractTaskQuery,
  useListContractTaskQuery,
  useGetErrorProneQuery
} = contractTaskApi

export const {
  endpoints: { getContractTask },
} = contractTaskApi
