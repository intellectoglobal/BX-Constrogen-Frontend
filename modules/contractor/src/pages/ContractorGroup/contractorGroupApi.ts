import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/vendor/group/'

export interface ContractorGroup {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const contractorGroupApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractorGroup: build.query<ListResponse<ContractorGroup>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.VENDOR_GROUP, id })),
        { type: tags.VENDOR_GROUP, id: 'LIST' },
      ] : [{ type: tags.VENDOR_GROUP, id: 'LIST' }],
    }),
    addContractorGroup: build.mutation<ContractorGroup, Partial<ContractorGroup>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_GROUP, id: 'LIST' }],
    }),
    getContractorGroup: build.query<ContractorGroup, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractorGroup, _err, id) => [{ type: tags.VENDOR_GROUP, id }],
    }),
    updateContractorGroup: build.mutation<ContractorGroup, Partial<ContractorGroup>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.VENDOR_GROUP, id: project?.id }],
    }),
    deleteContractorGroup: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.VENDOR_GROUP, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractorGroupMutation,
  useDeleteContractorGroupMutation,
  useGetContractorGroupQuery,
  useListContractorGroupQuery,
  useUpdateContractorGroupMutation,
  useGetErrorProneQuery,
} = contractorGroupApi
