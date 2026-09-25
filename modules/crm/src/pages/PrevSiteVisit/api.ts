import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/sale/customer/'

export interface SiteVisit {
  id: string
  key: number
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const customerApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSiteVisit: build.query<ListResponse<SiteVisit>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.CUSTOMER, id })),
        { type: tags.CUSTOMER, id: 'LIST' },
      ] : [{ type: tags.CUSTOMER, id: 'LIST' }],
    }),
    addSiteVisit: build.mutation<SiteVisit, Partial<SiteVisit>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CUSTOMER, id: 'LIST' }],
    }),
    getSiteVisit: build.query<SiteVisit, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_SiteVisit, _err, id) => [{ type: tags.CUSTOMER, id }],
    }),
    updateSiteVisit: build.mutation<SiteVisit, Partial<SiteVisit>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.CUSTOMER, id: project?.id }],
    }),

    deleteSiteVisit: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.CUSTOMER, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddSiteVisitMutation,
  useDeleteSiteVisitMutation,
  useGetSiteVisitQuery,
  useListSiteVisitQuery,
  useUpdateSiteVisitMutation,
  useGetErrorProneQuery,
} = customerApi
