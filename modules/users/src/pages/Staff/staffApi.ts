import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/client/staff/'

export interface Staff {
  id: number;
  staff_name: string;
  mobileno:any;
  panno:any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const staffApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listStaff: build.query<Array<Staff>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.STAFFS, id })),
        { type: tags.STAFFS, id: 'LIST' },
      ] : [{ type: tags.STAFFS, id: 'LIST' }],
    }),
    addStaff: build.mutation<Staff, Partial<Staff>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.STAFFS, id: 'LIST' }],
    }),
    getStaff: build.query<Staff, any>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Staff, _err, id) => [{ type: tags.STAFFS, id }],
    }),
    updateStaff: build.mutation<Staff, Partial<Staff>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (staff) => [{ type: tags.STAFFS, id: staff?.id }],
    }),
    deleteStaff: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (staff) => [{ type: tags.STAFFS, id: staff?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddStaffMutation,
  useDeleteStaffMutation,
  useGetStaffQuery,
  useListStaffQuery,
  useUpdateStaffMutation,
  useGetErrorProneQuery
} = staffApi

