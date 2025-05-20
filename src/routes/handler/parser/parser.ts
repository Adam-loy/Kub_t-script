import { Request } from 'express';

class PaginationQuery {
  constructor(public itemsPerPage: number, public page: number) {}
}

class FilterQuery {
  constructor(public filters: string[]) {}
}

class SortQuery {
  constructor(public sortBy: string[]) {}
}

class MetricQuery {
  constructor(public metricNames: string[] | null, public aggregationModes: string[] | null) {}
}

class DataSelectQuery {
  constructor(
    public paginationQuery: PaginationQuery,
    public sortQuery: SortQuery,
    public filterQuery: FilterQuery,
    public metricQuery: MetricQuery
  ) {}
}

// Parses pagination query parameters
function parsePaginationPathParameter(request: Request): PaginationQuery {
  const itemsPerPage = parseInt(request.query.itemsPerPage as string, 10) || 0;
  const page = parseInt(request.query.page as string, 10) || 0;

  // Frontend pages start from 1 and backend starts from 0
  return new PaginationQuery(itemsPerPage, page - 1);
}

// Parses query parameters of the request and returns a SortQuery object
function parseFilterPathParameter(request: Request): FilterQuery {
  const filterBy = request.query.filterBy as string || '';
  return new FilterQuery(filterBy.split(','));
}

// Parses query parameters of the request and returns a SortQuery object
function parseSortPathParameter(request: Request): SortQuery {
  const sortBy = request.query.sortBy as string || '';
  return new SortQuery(sortBy.split(','));
}

// Parses query parameters of the request and returns a MetricQuery object
function parseMetricPathParameter(request: Request): MetricQuery {
  const metricNamesParam = request.query.metricNames as string || null;
  const aggregationsParam = request.query.aggregations as string || null;

  const metricNames = metricNamesParam ? metricNamesParam.split(',') : null;
  const rawAggregations = aggregationsParam ? aggregationsParam.split(',') : null;

  return new MetricQuery(metricNames, rawAggregations);
}

// ParseDataSelectPathParameter parses query parameters of the request and returns a DataSelectQuery object
export function parseDataSelectPathParameter(request: Request): DataSelectQuery {
  const paginationQuery = parsePaginationPathParameter(request);
  const sortQuery = parseSortPathParameter(request);
  const filterQuery = parseFilterPathParameter(request);
  const metricQuery = parseMetricPathParameter(request);

  return new DataSelectQuery(paginationQuery, sortQuery, filterQuery, metricQuery);
}
