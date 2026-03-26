// =====================================================
// utils/filterQuery.js
// Reusable filtering, text search, sorting + pagination.
//
// Usage:
//   const result = await filterQuery(Order, req.query, ["currentStatus", "paymentMethod"])
//   Returns: { data: [...], pagination: { total, page, ... } }
//
// Supported query params:
//   ?page=2&limit=20
//   ?sortBy=createdAt&sortOrder=asc
//   ?startDate=2024-01-01&endDate=2024-12-31
//   ?search=keyword          → fulltext regex across searchFields
//   ?status=Active           → any field in allowedFilters
// =====================================================

const filterQuery = async (
  Model,
  queryParams,
  allowedFilters  = [],
  searchFields    = [],       // array of field paths to search
  populateOptions = null      // optional populate config
) => {
  const filter = {};

  // ── Date range ────────────────────────────────
  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};
    if (queryParams.startDate) filter.createdAt.$gte = new Date(queryParams.startDate);
    if (queryParams.endDate)   filter.createdAt.$lte = new Date(queryParams.endDate);
  }

  // ── Exact field filters ───────────────────────
  allowedFilters.forEach((field) => {
    const val = queryParams[field];
    if (val !== undefined && val !== "") filter[field] = val;
  });

  // ── Text search (regex across multiple fields) ─
  if (queryParams.search && searchFields.length > 0) {
    const regex = { $regex: queryParams.search.trim(), $options: "i" };
    filter.$or  = searchFields.map((f) => ({ [f]: regex }));
  }

  // ── Pagination ────────────────────────────────
  const page  = Math.max(parseInt(queryParams.page)  || 1, 1);
  const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
  const skip  = (page - 1) * limit;

  // ── Sorting ───────────────────────────────────
  const sortField = queryParams.sortBy    || "createdAt";
  const sortDir   = queryParams.sortOrder === "asc" ? 1 : -1;

  // ── Execute ───────────────────────────────────
  let query = Model.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit);
  if (populateOptions) query = query.populate(populateOptions);

  const [data, total] = await Promise.all([
    query.lean(),
    Model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page < Math.ceil(total / limit),
      hasPrev:    page > 1,
    },
  };
};

module.exports = filterQuery;