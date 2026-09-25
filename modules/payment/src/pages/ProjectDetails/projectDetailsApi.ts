import { api, tags, urlUtils } from '@igblsln/store'
import { ProjectInquiryQuery } from '@igblsln/model';

export interface ProjectDetails {
  id: string
  key: number
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const projectDetailsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProjectPurchaseDetails: build.query<ProjectDetails[], ProjectInquiryQuery>({
      query: ({ projectId }) => {
        console.log(projectId)
        return {
          url: urlUtils('/projectdetails', `?project_id=[${projectId || ''}]`),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.PROJECT_DETAILS, id } as const)),
        { type: tags.PROJECT_DETAILS, id: 'LIST' },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListProjectPurchaseDetailsQuery,
  useGetErrorProneQuery
} = projectDetailsApi
