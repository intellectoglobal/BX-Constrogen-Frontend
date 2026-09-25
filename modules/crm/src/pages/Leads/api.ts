import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/leads/leads/'


export const customerApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listLead: build.query<ListResponse<any>, any>({
      query: ({ page, size, status, active_followup, lead_name, contact_1 }) => {
        return {
          url: urlUtils(
            API_PATH,
            `?page=${page || 1}&page_size=${size || PAGE_SIZE}${status ? `&status=${status}` : ''}${active_followup ? `&active_followup=${active_followup}` : ''}${lead_name ? `&lead_name=${encodeURIComponent(lead_name)}` : ''}${contact_1 ? `&contact_1=${encodeURIComponent(contact_1)}` : ''}`
          ),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "CRM_LEAD", id })),
        { type: "CRM_LEAD", id: 'LIST' },
      ] : [{ type: "CRM_LEAD", id: 'LIST' }],
    }),
    addLead: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "CRM_LEAD", id: 'LIST' }],
    }),
    addFollowUp: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: '/leads/leads-related/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "CRM_LEAD", id: 'LIST' }],
    }),
    getLead: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Lead, _err, id) => [{ type: "CRM_LEAD", id }],
    }),
    getLeadStatus: build.query<any, void>({
      query: () => `/leads/status/`,
    }),
    getLeadProjects: build.query<any, void>({
      query: () => `/leads/project/all/active`,
    }),
    getFollowUpStatus: build.query<any, void>({
      query: () => `/leads/follow-up/status/`,
    }),
    getJunkLeads: build.query<any, any>({
      query: ({ page, size, lead_name, contact_1 }) => {
        return {
          url: urlUtils('/leads/junk-leads/', `?page=${page || 1}&page_size=${size || PAGE_SIZE}${lead_name ? `&lead_name=${encodeURIComponent(lead_name)}` : ''}${contact_1 ? `&contact_1=${encodeURIComponent(contact_1)}` : ''}`),
        };
      },
    }),
    getJunkLead: build.query<any, number>({
      query: (followupKey) => `/leads/junk-leads/${followupKey}/`,
      providesTags: (_JunkLead, _err, id) => [{ type: "CRM_JUNK_LEAD", id }],
    }),
    updateJunkLead: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `/leads/junk-leads/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (junkLead) => [{ type: "CRM_JUNK_LEAD", id: junkLead?.id }],
    }),
    getSiteVisitStatus: build.query<any, void>({
      query: () => `/leads/visit/status/`,
    }),
    checkContact1Exists: build.query<any, { contact_1: string; exclude_lead_key?: number }>({
      query: ({ contact_1, exclude_lead_key }) => {
        const params = new URLSearchParams();
        params.set('contact_1', contact_1);
        if (exclude_lead_key) {
          params.set('exclude_lead_key', String(exclude_lead_key));
        }
        return {
          url: `/leads/contact1-exists/?${params.toString()}`,
        };
      },
    }),

    updateLead: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "CRM_LEAD", id: project?.id }],
    }),
    updateLeadComments: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `/leads/lead/comments/${id}`,
          method: 'PUT',
          body,
        }
      },
    }),
    getCommentsForLeads: build.query<any, any>({
      query: (id) => `/leads/lead/comments/${id}`,
    }),
    updateFollowUp: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `/leads/leads-related/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "CRM_LEAD", id: project?.id }],
    }),
    deleteLead: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "CRM_LEAD", id: project?.id }],
    }),
    listCrmReportsToExport: build.query<ListResponse<any>, any>({
          query: ({ year, month }) => {
            return {
              url: urlUtils('/leads/export_report/', `?year=${year}&month=${month}`),
            };
          },
        }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddLeadMutation,
  useDeleteLeadMutation,
  useGetLeadQuery,
  useListLeadQuery,
  useGetLeadStatusQuery,
  useGetLeadProjectsQuery,
  useUpdateLeadMutation,
  useAddFollowUpMutation,
  useUpdateFollowUpMutation,
  useGetFollowUpStatusQuery,
  useGetJunkLeadsQuery,
  useGetJunkLeadQuery,
  useUpdateJunkLeadMutation,
  useGetSiteVisitStatusQuery,
  useGetCommentsForLeadsQuery,
  useUpdateLeadCommentsMutation,
  useLazyListCrmReportsToExportQuery,
  useGetErrorProneQuery,
  useLazyCheckContact1ExistsQuery,
} = customerApi
