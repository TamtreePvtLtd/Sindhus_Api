exports.paginate = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
      const totalItems = await model.countDocuments();
      const totalPages = Math.ceil(totalItems / pageSize);

      const items = model
        .find()
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      req.paginationResult = {
        items,
        pageInfo: {
          page,
          pageSize,
          totalPages,
          totalItems,
        },
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
