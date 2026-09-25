import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/leads/followupstages/'

export interface FollowUpStage {
  key: number
  descr: string;
}

export const followUpStagesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listFollowUpStages: build.query<FollowUpStage[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_FOLLOW_UP_STAGE, id: key })),
        { type: tags.CRM_FOLLOW_UP_STAGE, id: 'LIST' },
      ] : [{ type: tags.CRM_FOLLOW_UP_STAGE, id: 'LIST' }],
    }),
    addFollowUpStages: build.mutation<FollowUpStage, Partial<FollowUpStage>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_FOLLOW_UP_STAGE, id: 'LIST' }],
    }),
    getFollowUpStages: build.query<FollowUpStage, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_FollowUpStage, _err, key) => [{ type: tags.CRM_FOLLOW_UP_STAGE, id: key }],
    }),
    updateFollowUpStages: build.mutation<FollowUpStage, Partial<FollowUpStage>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [
        { type: tags.CRM_FOLLOW_UP_STAGE, id: project?.key },
        { type: tags.CRM_FOLLOW_UP_STAGE, id: 'LIST' }
      ],
    }),
    deleteFollowUpStages: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [
        { type: tags.CRM_FOLLOW_UP_STAGE, id: project?.key },
        { type: tags.CRM_FOLLOW_UP_STAGE, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddFollowUpStagesMutation,
  useDeleteFollowUpStagesMutation,
  useGetFollowUpStagesQuery,
  useListFollowUpStagesQuery,
  useUpdateFollowUpStagesMutation,
} = followUpStagesApi

export const {
  endpoints: { getFollowUpStages },
} = followUpStagesApi
