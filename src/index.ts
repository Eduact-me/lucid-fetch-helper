import { _omit } from './helpers';
import * as dayjs from 'dayjs';

export type OrderByType = {
  field: string;
  direction: 'asc' | 'desc' | undefined;
};
export type PaginationType = { page: number; perPage: number };
export type SearchByType = { field: string; query: string };
export type DateRangeType = { from: string; to: string };
export type ColumnsSettings = {
  customColumnsSelectionList: string[];
  method: 'exclude' | 'include';
};
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
interface Params {
  Model: any;
  columnsSettings?: ColumnsSettings;
  pagination?: PaginationType;
  orderBy?: OrderByType;
  searchQuery?: string;
  filters?: any[];
  dateRange?: DateRangeType;
  excludedSearchColumns?: string[];
  callback?(query: any): any;
}

export default async function fetch({
  Model,
  columnsSettings = { customColumnsSelectionList: ['*'], method: 'include' },
  pagination = { page: 1, perPage: 15 },
  orderBy,
  searchQuery = '',
  dateRange = { from: '', to: '' },
  excludedSearchColumns = [],
  filters = [],
  callback = () => {
    //
  },
}: Params): Promise<ReturnType> {
  if (!Model) throw new Error('Model is required');
  const columnsToBeSearched = _omit(Model.$keys.columnsToAttributes.all(), [
    'id',
    'updated_at',
    'created_at',
    ...(excludedSearchColumns || []),
  ]);
  const selectedColumns =
    columnsSettings.method === 'exclude'
      ? Object.keys(_omit(Model.$keys.columnsToAttributes.all(), columnsSettings.customColumnsSelectionList))
      : columnsSettings.customColumnsSelectionList;

  const query = Model.query().select(selectedColumns);
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
  }
  query.from(filtrationQuery.as('f1'));

  if (searchQuery && searchQuery.trim() !== '') {
    Object.values(columnsToBeSearched).forEach((column) => query.orWhere(column, 'ILIKE', `%${searchQuery}%`));
  }

  callback(query);

  query
    .limit(pagination.perPage)
    .offset(pagination.page <= 0 ? 0 : pagination.page - 1)
    .orderBy(orderBy?.field || 'id', orderBy?.direction || 'asc');

  const data = await query.exec();
  const [modelData] = await Model.query().count('* as total');
  return {
    meta: {
      page: pagination.page,
      perPage: pagination.perPage,
      lastPage: Math.ceil(Number(modelData.$extras.total) / pagination.perPage),
      found: data.length,
      total: Number(modelData.$extras.total),
    },
    data,
  };
}
