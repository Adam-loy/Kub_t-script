

// // Types for Metric Query 
// export type AggregationModes = string[]; //Aggregation modes like 'sum', 'avg', etc,

// export interface MetricQuery {
//     metricNames: string[];
//     aggregation: AggregationModes;
// }

// export function newMetricQuery(metricNames: string[] | null, aggregations: AggregationModes | null): MetricQuery{
//     return {
//         metricNames: metricNames || [],
//         aggregations: aggregations || []
//     }
// }

// export const NoMetrics: MetricQuery = newMetricQuery(null, null);

// export const StandardMetrics: MetricQuery = newMetricQuery(
//     ["cpuUsage", "memoryUsage"],
//     sum, we need to impor
// )

// // Types for Sort Query 
// export interface SortBy {
//     property: string;
//     ascending: boolean;
// }

// export interface SortQuery{
//     sortByList: SortBy[];
// }

// export function newSortQuery(sortByListRaw: string[]| null): SortQuery {
//     if (!sortByListRaw || sortByListRaw.length % 2 === 1) {
//         return { sortByList: []};
//     }

//     const sortByList: SortBy[] = [];
//     for (let i = 0; i + 1 < sortByListRaw.length; i += 2) {
//         const orderOption = 
//     }
// }


// // Types for Metric Query
// export type AggregationModes = string[]; // Aggregation modes like 'sum', 'avg', etc.

// export interface MetricQuery {
//   metricNames: string[];
//   aggregations: AggregationModes;
// }

// export function newMetricQuery(metricNames: string[] | null, aggregations: AggregationModes | null): MetricQuery {
//   return {
//     metricNames: metricNames || [],
//     aggregations: aggregations || []
//   };
// }

// export const NoMetrics: MetricQuery = newMetricQuery(null, null);

// export const StandardMetrics: MetricQuery = newMetricQuery(
//   ["cpuUsage", "memoryUsage"], // Replace with actual metric names from your TypeScript API
//   ["sum"] // Replace with actual aggregation modes
// );

// // Types for Sort Query
// export interface SortBy {
//   property: string;
//   ascending: boolean;
// }

// export interface SortQuery {
//   sortByList: SortBy[];
// }

// export function newSortQuery(sortByListRaw: string[] | null): SortQuery {
//   if (!sortByListRaw || sortByListRaw.length % 2 === 1) {
//     return { sortByList: [] }; // Return NoSort equivalent
//   }

//   const sortByList: SortBy[] = [];
//   for (let i = 0; i + 1 < sortByListRaw.length; i += 2) {
//     const orderOption = sortByListRaw[i];
//     const ascending = orderOption === "a";
//     const propertyName = sortByListRaw[i + 1];

//     if (orderOption !== "a" && orderOption !== "d") {
//       return { sortByList: [] }; // Invalid order option, return NoSort equivalent
//     }

//     sortByList.push({
//       property: propertyName,
//       ascending: ascending
//     });
//   }

//   return {
//     sortByList: sortByList
//   };
// }

// export const NoSort: SortQuery = { sortByList: [] };

// // Types for Filter Query
// export interface FilterBy {
//   property: string;
//   value: string;
// }

// export interface FilterQuery {
//   filterByList: FilterBy[];
// }

// export function newFilterQuery(filterByListRaw: string[] | null): FilterQuery {
//   if (!filterByListRaw || filterByListRaw.length % 2 === 1) {
//     return { filterByList: [] }; // Return NoFilter equivalent
//   }

//   const filterByList: FilterBy[] = [];
//   for (let i = 0; i + 1 < filterByListRaw.length; i += 2) {
//     const propertyName = filterByListRaw[i];
//     const propertyValue = filterByListRaw[i + 1];

//     filterByList.push({
//       property: propertyName,
//       value: propertyValue
//     });
//   }

//   return {
//     filterByList: filterByList
//   };
// }

// export const NoFilter: FilterQuery = { filterByList: [] };

// // Pagination Query (placeholder, implement if needed)
// export interface PaginationQuery {
//   page: number;
//   itemsPerPage: number;
// }

// export const NoPagination: PaginationQuery = { page: 0, itemsPerPage: 0 };
// export const DefaultPagination: PaginationQuery = { page: 1, itemsPerPage: 10 };

// // Data Select Query
// export interface DataSelectQuery {
//   paginationQuery: PaginationQuery;
//   sortQuery: SortQuery;
//   filterQuery: FilterQuery;
//   metricQuery: MetricQuery;
// }

// export function newDataSelectQuery(
//   paginationQuery: PaginationQuery,
//   sortQuery: SortQuery,
//   filterQuery: FilterQuery,
//   metricQuery: MetricQuery
// ): DataSelectQuery {
//   return {
//     paginationQuery: paginationQuery,
//     sortQuery: sortQuery,
//     filterQuery: filterQuery,
//     metricQuery: metricQuery
//   };
// }

// export const NoDataSelect: DataSelectQuery = newDataSelectQuery(NoPagination, NoSort, NoFilter, NoMetrics);
// export const StdMetricsDataSelect: DataSelectQuery = newDataSelectQuery(NoPagination, NoSort, NoFilter, StandardMetrics);
// export const DefaultDataSelect: DataSelectQuery = newDataSelectQuery(DefaultPagination, NoSort, NoFilter, NoMetrics);
// export const DefaultDataSelectWithMetrics: DataSelectQuery = newDataSelectQuery(
//   DefaultPagination,
//   NoSort,
//   NoFilter,
//   StandardMetrics
// );