import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/leadsource/'

export interface LeadSource {
  key: any
  descr: any
  category_id?: any
}
type LeadSourcesResponse = LeadSource[]

export const leadSourceApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getLeadSources: build.query<LeadSourcesResponse, void>({
      query: () => {
        return {
          url: urlUtils(API_PATH),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.LEADSOURCES, id } as const)),
        { type: tags.LEADSOURCES, id: 'LIST' },
      ],
    }),
    addLeadSource: build.mutation<LeadSource, Partial<LeadSource>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.LEADSOURCES, id: 'LIST' }],
    }),
    getLeadSource: build.query<LeadSource, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_LeadSource, _err, id) => [{ type: tags.LEADSOURCES, id }],
    }),
    updateLeadSource: build.mutation<LeadSource, Partial<LeadSource>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (leadSource) => [
        { type: tags.LEADSOURCES, id: leadSource?.key },
        { type: tags.LEADSOURCES, id: 'LIST' }
      ],
    }),
    deleteLeadSource: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (leadSource) => [
        { type: tags.LEADSOURCES, id: leadSource?.id },
        { type: tags.LEADSOURCES, id: 'LIST' }
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddLeadSourceMutation,
  useDeleteLeadSourceMutation,
  useGetLeadSourcesQuery,
  useUpdateLeadSourceMutation,
  useGetErrorProneQuery
} = leadSourceApi
