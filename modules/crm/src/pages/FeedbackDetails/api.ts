import { api, PAGE_SIZE, urlUtils, tags } from '@igblsln/store'

const feedbackAPIPath = '/leads/feedback/'
const feedbackDetailsAPIPath = '/leads/feedback-details/'

export interface Feedback {
  key: any
  descr: any
}
type FeedbacksResponse = Feedback[]

export interface FeedbackDetail {
  key: any
  descr: any
  feedback_id: any
}
type FeedbackDetailsResponse = FeedbackDetail[]
type GroupedFeedbackDetailsResponse = Array<{
  feedback?: { key?: any; descr?: any }
  feedback_details?: FeedbackDetail[]
}>

const normalizeFeedbackDetailsResponse = (
  response: FeedbackDetailsResponse | GroupedFeedbackDetailsResponse | { data?: any[] } | undefined
): FeedbackDetailsResponse => {
  if (!response) return []

  const payload = Array.isArray(response)
    ? response
    : Array.isArray((response as any)?.data)
      ? (response as any).data
      : []

  if (payload.length === 0) return []

  const firstItem = payload[0] as any
  if (firstItem?.feedback_details && Array.isArray(firstItem.feedback_details)) {
    return payload.flatMap((group: any) => {
      const feedbackId = group?.feedback?.key
      const details = Array.isArray(group?.feedback_details) ? group.feedback_details : []
      return details.map((detail: FeedbackDetail) => ({
        ...detail,
        feedback_id: detail?.feedback_id ?? feedbackId,
      }))
    })
  }

  return payload as FeedbackDetailsResponse
}

export const feedbackApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getFeedbacks: build.query<FeedbacksResponse, void>({
      query: () => {
        return {
          url: urlUtils(feedbackAPIPath),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: "FEEDBACK", id } as const)),
        { type: "FEEDBACK", id: 'LIST' },
      ],
    }),
    addFeedback: build.mutation<Feedback, Partial<Feedback>>({
      query: (body) => ({
        url: feedbackAPIPath,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "FEEDBACK", id: 'LIST' }],
    }),
    getFeedback: build.query<Feedback, number>({
      query: (id) => `${feedbackAPIPath}${id}`,
    }),
    updateFeedback: build.mutation<Feedback, Partial<Feedback>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${feedbackAPIPath}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (feedback) => [
        { type: "FEEDBACK", id: feedback?.key },
        { type: "FEEDBACK", id: 'LIST' }
      ],
    }),
    deleteFeedback: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${feedbackAPIPath}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (feedback) => [
        { type: "FEEDBACK", id: feedback?.id },
        { type: "FEEDBACK", id: 'LIST' }
      ],
    }),
    getFeedbackDetails: build.query<FeedbackDetailsResponse, void>({
      query: () => {
        return {
          url: urlUtils(feedbackDetailsAPIPath),
        };
      },
      transformResponse: (response: FeedbackDetailsResponse | GroupedFeedbackDetailsResponse | { data?: any[] }) =>
        normalizeFeedbackDetailsResponse(response),
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: "FEEDBACK_DETAIL", id } as const)),
        { type: "FEEDBACK_DETAIL", id: 'LIST' },
      ],
    }),
    addFeedbackDetail: build.mutation<FeedbackDetail, Partial<FeedbackDetail>>({
      query: (body) => ({
        url: feedbackDetailsAPIPath,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "FEEDBACK_DETAIL", id: 'LIST' }],
    }),
    getFeedbackDetail: build.query<FeedbackDetail, number>({
      query: (id) => `${feedbackDetailsAPIPath}${id}`,
    }),
    updateFeedbackDetail: build.mutation<FeedbackDetail, Partial<FeedbackDetail>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${feedbackDetailsAPIPath}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (feedbackDetail) => [
        { type: "FEEDBACK_DETAIL", id: feedbackDetail?.key },
        { type: "FEEDBACK_DETAIL", id: 'LIST' }
      ],
    }),
    deleteFeedbackDetail: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${feedbackDetailsAPIPath}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (feedbackDetail) => [
        { type: "FEEDBACK_DETAIL", id: feedbackDetail?.id },
        { type: "FEEDBACK_DETAIL", id: 'LIST' }
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetFeedbacksQuery,
  useAddFeedbackMutation,
  useGetFeedbackQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbackDetailsQuery,
  useAddFeedbackDetailMutation,
  useGetFeedbackDetailQuery,
  useUpdateFeedbackDetailMutation,
  useDeleteFeedbackDetailMutation,
  useGetErrorProneQuery
} = feedbackApi
