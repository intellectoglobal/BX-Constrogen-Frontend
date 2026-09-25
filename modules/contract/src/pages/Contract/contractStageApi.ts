import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/order/items/'

export interface ContractStage {
  key: number,
  createddttm: string;
  stage_key : any;
  netamt: number;
  createdby: string;
  lastmodifiedby: string;
  lastmodifieddttm: string;
}

export interface ContractStagePost {
  purchase_order_id: number,
  items: ContractStage[];
}

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractStage: build.query<ListResponse<ContractStage>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ stage_key }) => ({ type: tags.CONTRACT_STAGE, stage_key })),
        { type: tags.CONTRACT_STAGE, id: 'LIST' },
      ] : [{ type: tags.CONTRACT_STAGE, id: 'LIST' }],
    }),
    getContractStage: build.query<ContractStage, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractStage, _err, id) => [{ type: tags.CONTRACT_STAGE, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetContractStageQuery,
  useListContractStageQuery,
  useGetErrorProneQuery
} = vendorApi

export const {
  endpoints: { getContractStage },
} = vendorApi
