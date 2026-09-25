import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { FloorUnitQuery, ListResponse, ModalBase } from '@igblsln/model';

const API_PATH = '/project/elevation/'

export interface ProjectImage {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const projectImageApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProjectImage: build.query<ModalBase[], any>({
      query: ({ projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?project_id=${projectId || ''}&block_id=${blockId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.PROJECT_IMAGES, id })),
        { type: tags.PROJECT_IMAGES, id: 'LIST' },
      ] : [{ type: tags.PROJECT_IMAGES, id: 'LIST' }],
    }),
    addProjectImage: build.mutation<ProjectImage, Partial<ProjectImage>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_IMAGES, id: 'LIST' }],
    }),
    getProjectImage: build.query<ProjectImage, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectImage, _err, id) => [{ type: tags.PROJECT_IMAGES, id }],
    }),
    updateProjectImage: build.mutation<ProjectImage, Partial<ProjectImage>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_IMAGES, id: project?.id }],
    }),
    deleteProjectImage: build.mutation<{ success: boolean; id: number }, any>(
      {
        query(id) {
          return {
            url: `${API_PATH}${id}`, 
            method: 'DELETE',
          };
        },
        invalidatesTags: (result) => [{ type: tags.PROJECT_IMAGES, id: result?.id }],
      }
    ),    
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddProjectImageMutation,
  useDeleteProjectImageMutation,
  useGetProjectImageQuery,
  useListProjectImageQuery,
  useUpdateProjectImageMutation,
  useGetErrorProneQuery,
} = projectImageApi

export const {
  endpoints: { getProjectImage },
} = projectImageApi
