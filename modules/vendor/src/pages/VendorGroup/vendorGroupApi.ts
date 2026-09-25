import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/vendor/group/'

export interface VendorGroup {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const vendorGroupApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listVendorGroup: build.query<ListResponse<VendorGroup>, PagingQuery>({
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
    addVendorGroup: build.mutation<VendorGroup, Partial<VendorGroup>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_GROUP, id: 'LIST' }],
    }),
    getVendorGroup: build.query<VendorGroup, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_VendorGroup, _err, id) => [{ type: tags.VENDOR_GROUP, id }],
    }),
    updateVendorGroup: build.mutation<VendorGroup, Partial<VendorGroup>>({
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
    deleteVendorGroup: build.mutation<{ success: boolean; id: number }, number>({
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
  useAddVendorGroupMutation,
  useDeleteVendorGroupMutation,
  useGetVendorGroupQuery,
  useListVendorGroupQuery,
  useUpdateVendorGroupMutation,
  useGetErrorProneQuery,
} = vendorGroupApi

export const {
  endpoints: { getVendorGroup },
} = vendorGroupApi
