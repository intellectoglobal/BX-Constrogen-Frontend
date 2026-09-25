import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/project/status/'


export interface ProjectStatus {
  id: any
  key: any
  descr: any
}
type ProjectStatusesResponse = ProjectStatus[]

export const projectStatusApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getProjectStatuses: build.query<ProjectStatusesResponse, void>({
      query: () => {
        return {
          url: API_PATH,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.PROJECT_STATUS, id } as const)),
        { type: tags.PROJECT_STATUS, id: 'LIST' },
      ],
    }),
    addProjectStatus: build.mutation<ProjectStatus, Partial<ProjectStatus>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_STATUS, id: 'LIST' }],
    }),
    getProjectStatus: build.query<ProjectStatus, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectStatus, _err, id) => [{ type: tags.PROJECT_STATUS, id }],
    }),
    updateProjectStatus: build.mutation<ProjectStatus, Partial<ProjectStatus>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (projectStatus) => [{ type: tags.PROJECT_STATUS, id: projectStatus?.id }],
    }),
    deleteProjectStatus: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (projectStatus) => [{ type: tags.PROJECT_STATUS, id: projectStatus?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddProjectStatusMutation,
  useDeleteProjectStatusMutation,
  useGetProjectStatusQuery,
  useGetProjectStatusesQuery,
  useUpdateProjectStatusMutation,
  useGetErrorProneQuery,
} = projectStatusApi

export const {
  endpoints: { getProjectStatus },
} = projectStatusApi
