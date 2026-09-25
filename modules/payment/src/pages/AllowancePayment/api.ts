import { api, PAGE_SIZE, tags, urlUtils, userapi } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/salary/'

export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSalaries: build.query<ListResponse<any>, any>({
      query: ({ page, size, month, year }) => {
        return {
          url: urlUtils(API_PATH, `?type=salary&page=${page || 1}&page_size=${size || PAGE_SIZE}${month ? `&month=${month}` : ''}${year ? `&year=${year}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "SALARIES", key })),
        { type: "SALARIES", id: 'LIST' },
      ] : [{ type: "SALARIES", id: 'LIST' }],
    }),
    paySalary: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "SALARIES", id: 'LIST' }],
    }),
    deleteSalary: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: "SALARIES", id: payment?.id }],
    }),
    listAllowances: build.query<ListResponse<any>, any>({
      query: ({ page, size, month, year }) => {
        return {
          url: urlUtils(API_PATH, `?type=allowance&page=${page || 1}&page_size=${size || PAGE_SIZE}${month ? `&month=${month}` : ''}${year ? `&year=${year}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "ALLOWANCES", key })),
        { type: "ALLOWANCES", id: 'LIST' },
      ] : [{ type: "ALLOWANCES", id: 'LIST' }],
    }),
    payAllowance: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "ALLOWANCES", id: 'LIST' }],
    }),
    deleteAllowance: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: "ALLOWANCES", id: payment?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const user = userapi.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getAllEmployees: build.query<Array<any>, void>({
      query: () => {
        return {
          url: `/user/?without_pagination=1`,
        };
      },
    }),
  }),
})

export const {
  useListSalariesQuery,
  usePaySalaryMutation,
  useDeleteSalaryMutation,
  useListAllowancesQuery,
  usePayAllowanceMutation,
  useDeleteAllowanceMutation,
  useGetErrorProneQuery,
} = customApi

export const {
  useGetAllEmployeesQuery,
} = user