import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/contract/type/'

export interface ContractorType {
  id: string
  key: number
  descr: string;
  contractor?:string
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const vendorTypeApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractorType: build.query<ListResponse<ContractorType>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.VENDOR_TYPE, id })),
        { type: tags.VENDOR_TYPE, id: 'LIST' },
      ] : [{ type: tags.VENDOR_TYPE, id: 'LIST' }],
    }),
    addContractorType: build.mutation<ContractorType, Partial<ContractorType>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_TYPE, id: 'LIST' }],
    }),
    getContractorType: build.query<ContractorType, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractorType, _err, id) => [{ type: tags.VENDOR_TYPE, id }],
    }),
    updateContractorType: build.mutation<ContractorType, Partial<ContractorType>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.VENDOR_TYPE, id: project?.id }],
    }),
    deleteContractorType: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.VENDOR_TYPE, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractorTypeMutation,
  useDeleteContractorTypeMutation,
  useGetContractorTypeQuery,
  useListContractorTypeQuery,
  useUpdateContractorTypeMutation,
  useGetErrorProneQuery,
} = vendorTypeApi

export const {
  endpoints: { getContractorType },
} = vendorTypeApi
