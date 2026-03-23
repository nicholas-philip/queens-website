// =====================================================
// utils/filterQuery.js
// Reusable filtering + pagination for any Mongoose model.
//
// Usage:
//   const result = await filterQuery(Order, req.query, ["currentStatus"])
//   Returns: { data: [...], pagination: { total, page, ... } }
// =====================================================

const filterQuery = async (Model, queryParams, allowedFilters = []) => {
  const filter = {};

  // Date range  →  ?startDate=2024-01-01&endDate=2024-12-31
  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};
    if (queryParams.startDate) filter.createdAt.$gte = new Date(queryParams.startDate);
    if (queryParams.endDate)   filter.createdAt.$lte = new Date(queryParams.endDate);
  }

  // Field filters  →  ?status=Active&category=abc123
  allowedFilters.forEach((field) => {
    if (queryParams[field] !== undefined && queryParams[field] !== "")
      filter[field] = queryParams[field];
  });

  // Pagination
  const page  = Math.max(parseInt(queryParams.page)  || 1, 1);
  const limit = Math.min(parseInt(queryParams.limit) || 10, 100);
  const skip  = (page - 1) * limit;

  // Sorting  →  ?sortBy=createdAt&sortOrder=desc
  const sortField = queryParams.sortBy    || "createdAt";
  const sortDir   = queryParams.sortOrder === "asc" ? 1 : -1;

  const [data, total] = await Promise.all([
    Model.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit),
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