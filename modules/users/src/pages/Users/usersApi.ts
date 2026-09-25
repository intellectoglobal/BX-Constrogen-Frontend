import { userapi, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/user/'

export interface User {
  id: number;
  email: string;
  user_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_pic: any,
  role:any;
  company:any;
  client_id:any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const userApi = userapi.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listUser: build.query<ListResponse<User>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.USERS, id })),
        { type: tags.USERS, id: 'LIST' },
      ] : [{ type: tags.USERS, id: 'LIST' }],
    }),
    addUser: build.mutation<User, Partial<User>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.USERS, id: 'LIST' }],
    }),
    getUser: build.query<User, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_User, _err, id) => [{ type: tags.USERS, id }],
    }),
    updateUser: build.mutation<User, Partial<User>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [
        { type: tags.USERS, id: project?.id },
        { type: tags.USERS, id: 'LIST' },
      ],
    }),
    deleteUser: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.USERS, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUserQuery,
  useListUserQuery,
  useUpdateUserMutation,
  useGetErrorProneQuery
} = userApi

