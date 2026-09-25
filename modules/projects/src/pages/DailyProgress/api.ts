import { api, PAGE_SIZE, tags, urlUtils } from "@igblsln/store";
import { PagingQuery, ListResponse, SaveResponse } from "@igblsln/model";

const API_PATH = "/tracker/daily_progress/";

export interface DropDownData {
  key: any;
  name?: any;
  desc?: any;
  id?: any;
}

export const dailyProgressApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listDailyProgress: build.query<ListResponse<any>, any>({
      query: ({ page, size, project, type, from, to }) => {
        return {
          url: urlUtils(
            API_PATH,
            `?page=${page || 1}&page_size=${size || PAGE_SIZE}${
              project ? `&project=${project}` : ""
            }${from ? `&from_date=${from}` : ""}${to ? `&to_date=${to}` : ""}${
              type ? `&type=${type}` : ""
            }`
          ),
        };
      },
      transformResponse(baseQueryReturnValue: ListResponse<any>, meta, arg) {
        baseQueryReturnValue["results"] = baseQueryReturnValue.results.map(
          (d, index) => {
            return {
              ...d,
              sno: index + 1,
            };
          }
        );
        return baseQueryReturnValue;
      },
      providesTags: (result) =>
        result
          ? [
              ...result?.results?.map(({ key }) => ({
                type: tags.PURCHASE_ORDER,
                key,
              })),
              { type: tags.PURCHASE_ORDER, id: "LIST" },
            ]
          : [{ type: tags.PURCHASE_ORDER, id: "LIST" }],
    }),
    addDailyProgress: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: tags.PURCHASE_ORDER, id: "LIST" }],
    }),
    getDailyProgress: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PurchaseOrder, _err, id) => [
        { type: tags.PURCHASE_ORDER, id },
      ],
    }),
    updateDailyProgress: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data;
        return {
          url: `${API_PATH}${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (order) => [
        { type: tags.PURCHASE_ORDER, id: order?.key },
      ],
    }),
    deleteDailyProgress: build.mutation<
      { success: boolean; id: number },
      number
    >({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (order) => [
        { type: tags.PURCHASE_ORDER, id: order?.id },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => "error-prone",
    }),
  }),
});

export const {
  useAddDailyProgressMutation,
  useDeleteDailyProgressMutation,
  useGetDailyProgressQuery,
  useListDailyProgressQuery,
  useUpdateDailyProgressMutation,
  useGetErrorProneQuery,
} = dailyProgressApi;
