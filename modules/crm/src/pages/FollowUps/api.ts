import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/leads/follow-up/'

export interface FollowUp {
  id: string
  key: number
  descr: string;
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  feedback_key?: {
    key: number;
    descr: string;
  } | number;
  followup_details_key?: {
    key: number;
    descr: string;
  } | number;
  lead_name?: string;
  contact_1?: string;
  status_key?: any;
  follow_notes?: string;
  leadno?: string;
  last_followup_date?: string;
}

export const followUpApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listFollowUp: build.query<ListResponse<FollowUp>, any>({
      query: ({ page, size, date, project, status, lead_name, contact_1 }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${date ? `&date=${date}` : ''}${project ? `&project=${project}` : ''}${status ? `&status=${status}` : ''}${lead_name ? `&lead_name=${encodeURIComponent(lead_name)}` : ''}${contact_1 ? `&contact_1=${encodeURIComponent(contact_1)}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result.results.map(({ key: id }) => ({ type: "FOLLOW_UP", id } as const)),
        { type: "FOLLOW_UP", id: 'LIST' },
      ] : [{ type: "FOLLOW_UP", id: 'LIST' }],
    }),
    addFollowUp: build.mutation<FollowUp, Partial<FollowUp>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "FOLLOW_UP", id: 'LIST' }],
    }),
    getFollowUp: build.query<FollowUp, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_FollowUp, _err, id) => [{ type: "FOLLOW_UP", id }],
    }),
    updateFollowUpComments: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}comments/${id}`,
          method: 'PUT',
          body,
        }
      },
    }),
    getCommentsForFollowUp: build.query<any, any>({
      query: (id) => `${API_PATH}comments/${id}`,
    }),
    updateFollowUpData: build.mutation<FollowUp, Partial<FollowUp>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (followUp) => [
        { type: "FOLLOW_UP", id: followUp?.key },
        { type: "FOLLOW_UP", id: 'LIST' }
      ],
    }),
    deleteFollowUp: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (followUp) => [
        { type: "FOLLOW_UP", id: followUp?.id },
        { type: "FOLLOW_UP", id: 'LIST' }
      ],
    }),
    getFollowUpStatus: build.query<any, void>({
      query: () => `/leads/follow-up/status/`,
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetFollowUpQuery,
  useListFollowUpQuery,
  useUpdateFollowUpDataMutation,
  useGetFollowUpStatusQuery,
  useGetErrorProneQuery,
  useGetCommentsForFollowUpQuery,
  useUpdateFollowUpCommentsMutation
} = followUpApi
