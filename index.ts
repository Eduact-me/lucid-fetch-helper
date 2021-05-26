import { _omit } from "./helpers";
import {
  DateRangeType,
  OrderByType,
  PaginationType,
} from "./fetchAllFilteredPagination";
import dayjs from "dayjs";
export async function testFetch(
  Model: any,
  { page = 1, perPage = 15 }: PaginationType,
  orderBy?: OrderByType,
  searchQuery = "",
  filters?: Array<any>,
  dateRange?: DateRangeType,
  customColumnsSelectionList = ["*"]
) {
  if (!Model) throw new Error("Model is required");
  const columnsToBeSearched = _omit(Model.$keys.attributesToColumns.all(), [
    "id",
    "uuid",
    "updatedAt",
    "createdAt",
  ]);

  const query = Model.query().select(customColumnsSelectionList);
  let filtrationQuery = Model.query().select("*");

  if (dateRange?.from) {
    filtrationQuery.andWhere(
      "created_at",
      ">=",
      dayjs(dateRange.from, "YYYY/MM/DD").format("YYYY-MM-DD")
    );
  }
  if (dateRange?.to) {
    filtrationQuery.andWhere(
      "created_at",
      "<=",
      dayjs(dateRange.to, "YYYY/MM/DD").format("YYYY-MM-DD")
    );
  }
  if (filters instanceof Array && filters.length > 0) {
    filters.forEach((filter) => {
      const [key, value] = Object.entries(filter)[0];
      filtrationQuery.andWhere(key, "=", String(value));
    });

    query.from(filtrationQuery.as("f1"));
  }

  if (typeof searchQuery === "string" && searchQuery.trim() !== "") {
    Object.keys(columnsToBeSearched).forEach((column) =>
      query.orWhere(column, "ILIKE", `%${searchQuery}%`)
    );
  }

  query
    .offset(page)
    .limit(perPage)
    .orderBy(orderBy?.field || "id", orderBy?.direction || "asc");

  const data = await query.exec();
  const [count] = await Model.query().count("* as total");
  // const count =
  return {
    meta: {
      page,
      perPage,
      lastPage: Math.ceil(data.length / perPage),
      found: data.length,
      total: Number(count.total),
    },
    data,
  };
}
