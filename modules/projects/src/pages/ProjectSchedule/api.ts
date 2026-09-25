import { api, PAGE_SIZE, tags, urlUtils } from "@igblsln/store";
import { PagingQuery, ListResponse } from "@igblsln/model";

const API_PATH = "/project/schedule/";

export interface Schedules {
  id: string;
  key: number;
  descr: string;
  name: string;
  type: string;
  lastmodifiedby?: any;
  lastmodifieddttm?: any;
}

export const schedulesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSchedules: build.query<ListResponse<Schedules>, PagingQuery>({
      query: ({ page, size, type }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(
            API_PATH,
            `?page=${page || 1}&page_size=${size || PAGE_SIZE}${
              type ? `&type=${type}` : ""
            }`
          ),
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result?.results?.map(({ id }) => ({
                type: tags.INVENTORY_MFGR,
                id,
              })),
              { type: tags.INVENTORY_MFGR, id: "LIST" },
            ]
          : [{ type: tags.INVENTORY_MFGR, id: "LIST" }],
    }),
    listSchedulesWithoutPagination: build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils(API_PATH,`?without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: tags.CONTRACT_INVOICE, key })),
        { type: tags.CONTRACT, id: 'LIST' },
      ] : [{ type: tags.CONTRACT, id: 'LIST' }],
    }),
    addSchedules: build.mutation<Schedules, Partial<Schedules>>({
      query: (body) => ({
        url: API_PATH,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_MFGR, id: "LIST" }],
    }),
    getSchedules: build.query<Schedules, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Purposes, _err, id) => [
        { type: tags.INVENTORY_MFGR, id },
      ],
    }),
    updateSchedules: build.mutation<Schedules, Partial<Schedules>>({
      query(data) {
        const { key: id, ...body } = data;
        return {
          url: `${API_PATH}${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (project) => [
        { type: tags.INVENTORY_MFGR, id: project?.id },
      ],
    }),
    deleteSchedules: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (project) => [
        { type: tags.INVENTORY_MFGR, id: project?.id },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => "error-prone",
    }),
  }),
});

export const {
  useAddSchedulesMutation,
  useDeleteSchedulesMutation,
  useGetSchedulesQuery,
  useListSchedulesQuery,
  useListSchedulesWithoutPaginationQuery,
  useUpdateSchedulesMutation,
  useGetErrorProneQuery,
} = schedulesApi;

export const {
  endpoints: { getSchedules },
} = schedulesApi;
