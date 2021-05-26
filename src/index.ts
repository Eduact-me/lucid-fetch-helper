import { _omit } from './helpers';
import dayjs from 'dayjs';

export type OrderByType = {
  field: string;
  direction: 'asc' | 'desc' | undefined;
};
export type PaginationType = { page: number; perPage: number };
export type SearchByType = { field: string; query: string };
export type DateRangeType = { from: string; to: string };
type ReturnType = {
  meta: {
    page: number;
    perPage: number;
    lastPage: number;
    found: number;
    total: number;
  };
  data: any[];
};
export default async function fetch(
  Model: any,
  { page = 1, perPage = 15 }: PaginationType,
  orderBy?: OrderByType,
  searchQuery = '',
  filters?: any[],
  dateRange?: DateRangeType,
  customColumnsSelectionList = ['*'],
): Promise<ReturnType> {
  if (!Model) throw new Error('Model is required');
  const columnsToBeSearched = _omit(Model.$keys.attributesToColumns.all(), ['id', 'updatedAt', 'createdAt']);

  const query = Model.query().select(customColumnsSelectionList);
  const filtrationQuery = Model.query().select('*');

  if (dateRange?.from) {
    filtrationQuery.andWhere('created_at', '>=', dayjs(dateRange.from, 'YYYY/MM/DD').format('YYYY-MM-DD'));
  }
  if (dateRange?.to) {
    filtrationQuery.andWhere('created_at', '<=', dayjs(dateRange.to, 'YYYY/MM/DD').format('YYYY-MM-DD'));
  }
  if (filters instanceof Array && filters.length > 0) {
    filters.forEach((filter) => {
      const [key, value] = Object.entries(filter)[0];
      filtrationQuery.andWhere(key, '=', String(value));
    });

    query.from(filtrationQuery.as('f1'));
  }

  if (searchQuery && searchQuery.trim() !== '') {
    Object.values(columnsToBeSearched).forEach((column) => query.orWhere(column, 'ILIKE', `%${searchQuery}%`));
  }

  query
    .limit(perPage)
    .offset(page <= 0 ? 0 : page - 1)
    .orderBy(orderBy?.field || 'id', orderBy?.direction || 'asc');

  const data = await query.exec();
  const [count] = await Model.query().count('* as total');

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
