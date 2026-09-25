import { api, PAGE_SIZE, tags, urlUtils } from "@igblsln/store";
import { ListResponse } from "@igblsln/model";

export type ItemRate = {
  date: string;
  vendor: string;
  project: string;
  qty: string;
  uom: string;
  without_gst: number;
  gst: number;
  with_gst: number;
};

export type ItemRateSummary = {
  item_name: string;
  item_brand?: string;
  item_uom: string;
  highest: ItemRate;
  lowest: ItemRate;
};

export type ItemRateResponse = ListResponse<ItemRate> & {
  summary?: ItemRateSummary;
};

const API_PATH = "/inventory/item/";

export const itemRatesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listItemRates: build.query<
      ItemRateResponse,
      { item_key?: number; brand?: number | string; model?: string; page?: number; size?: number }
    >({
      query: ({ item_key, brand, model, page = 1, size = PAGE_SIZE }) => ({
        url: urlUtils(
          API_PATH,
          `rate/?page=${page}&page_size=${size}${
            item_key ? `&item_key=${item_key}` : ""
          }${
            brand ? `&brand=${brand}` : ""
          }${
            model ? `&model=${model}` : ""
          }`
        ),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map((item) => ({
                type: tags.INVENTORY_ITEM,
                id: `${item.date}-${item.vendor}-${item.project}`,
              })),
              { type: tags.INVENTORY_ITEM, id: "RATE_LIST" },
            ]
          : [{ type: tags.INVENTORY_ITEM, id: "RATE_LIST" }],
    }),
    listItemModels: build.query<
      { name: string }[],
      { brand?: number | string,
        item?: number,
      }
    >({
      query: ({ item, brand }) => ({
        url: urlUtils(
          API_PATH,
          `models/?without_pagination=1${item ? `&item=${item}` : ""}${brand ? `&brand=${brand}` : ""}`
        ),
      }),
      providesTags: [{ type: tags.INVENTORY_ITEM, id: "MODEL_LIST" }],
    }),
  }),
});

export const { useListItemRatesQuery, useListItemModelsQuery } = itemRatesApi;