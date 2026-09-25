import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/leads/visit/'

export interface SiteVisit {
  id: string
  key: number
  descr: string;
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  visit_date?: string | Date
}

export const siteVisitApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSiteVisit: build.query<ListResponse<SiteVisit>, any>({
      query: ({ page, size, date, project, status, lead_name, contact_1 }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${date ? `&date=${date}` : ''}${project ? `&project=${project}` : ''}${status ? `&status=${status}` : ''}${lead_name ? `&lead_name=${encodeURIComponent(lead_name)}` : ''}${contact_1 ? `&contact_1=${encodeURIComponent(contact_1)}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result.results.map(({ key: id }) => ({ type: "SITE_VISIT", id } as const)),
        { type: "SITE_VISIT", id: 'LIST' },
      ] : [{ type: "SITE_VISIT", id: 'LIST' }],
    }),
    addSiteVisit: build.mutation<SiteVisit, Partial<SiteVisit>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "SITE_VISIT", id: 'LIST' }],
    }),
    getSiteVisit: build.query<SiteVisit, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_SiteVisit, _err, id) => [{ type: "SITE_VISIT", id }],
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
      invalidatesTags: (siteVisit) => [
        { type: "SITE_VISIT", id: siteVisit?.key },
        { type: "SITE_VISIT", id: 'LIST' }
      ],
    }),
    deleteSiteVisit: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (siteVisit) => [
        { type: "SITE_VISIT", id: siteVisit?.id },
        { type: "SITE_VISIT", id: 'LIST' }
      ],
    }),
    updateSiteVisitComments: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `/leads/visit/comments/${id}`,
          method: 'PUT',
          body,
        }
      },
    }),
    getCommentsForSiteVisit: build.query<any, void>({
      query: (id) => `/leads/visit/comments/${id}`,
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
  useGetCommentsForSiteVisitQuery,
  useUpdateSiteVisitCommentsMutation,
  useGetErrorProneQuery,
} = siteVisitApi
