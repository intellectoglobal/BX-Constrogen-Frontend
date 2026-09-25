import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { AvailabilityQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/units/available/'

export interface Availability {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const AvailabilityApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listAvailability: build.query<ListResponse<Availability>, any>({
      query: ({ page, size, projectId, block }) => {
        return {
            url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId}&block=${block}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.AVAILABILITY, id })),
        { type: tags.AVAILABILITY, id: 'LIST' },
      ] : [{ type: tags.AVAILABILITY, id: 'LIST' }],
    }),
    addAvailability: build.mutation<Availability, Partial<Availability>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: tags.AVAILABILITY, id: 'LIST' },
        { type: tags.PROPERTY, id: 'LIST' } // Invalidate properties cache for real-time sync
      ],
    }),
    getAvailability: build.query<Availability, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Availability, _err, id) => [{ type: tags.AVAILABILITY, id }],
    }),
    updateAvailability: build.mutation<Availability, Partial<Availability>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (availability) => [
        { type: tags.AVAILABILITY, id: availability?.id },
        { type: tags.PROPERTY, id: 'LIST' } // Invalidate properties cache for real-time sync
      ],
    }),
    deleteAvailability: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (availability) => [
        { type: tags.AVAILABILITY, id: availability?.id },
        { type: tags.PROPERTY, id: 'LIST' } // Invalidate properties cache for real-time sync
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useGetAvailabilityQuery,
  useListAvailabilityQuery,
  useUpdateAvailabilityMutation,
  useGetErrorProneQuery,
} = AvailabilityApi

export const {
  endpoints: { getAvailability },
} = AvailabilityApi
