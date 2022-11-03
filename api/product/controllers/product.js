const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async findOne(ctx) {
    const { slug } = ctx.params;

    const entity = await strapi.services.product.findOne({ slug });
    return sanitizeEntity(entity, { model: strapi.models.product });
  },
  async bestSeller(ctx) {
    const page = parseInt(ctx.query.page) || 1;
    const pageSize = parseInt(ctx.query.pageSize) || 20;

    const productCount = await strapi
      .query("product")
      .model.find({ status: true })
      .count();
    let offset = (await (parseInt(page) - 1)) * parseInt(pageSize);
    let totalPage = await Math.ceil(productCount / parseInt(pageSize));
    const data = await strapi
      .query("product")
      .model.find({ status: true })
      .select(["name", "price", "quantity", "image"])
      .limit(parseInt(pageSize))
      .skip(offset)
      .sort({ sold: "desc" });
    const pagination = {
      totalPage,
      page,
      pageSize,
    };
    return { data, pagination };
  },

  async productsByCategory(ctx) {
    const category = ctx.query.category || null;
    const page = parseInt(ctx.query.page) || 1;
    const pageSize = parseInt(ctx.query.pageSize) || 20;
    let offset = (await (parseInt(page) - 1)) * parseInt(pageSize);
    const categoryId = await strapi
      .query("category")
      .model.find({ name: category, status: true })
      .select(["id"]);
    let data = [];
    if (categoryId[0].id) {
      data = await strapi
        .query("product")
        .model.find({ categories: { $elemMatch: { $eq: categoryId[0].id } } })
        .limit(pageSize)
        .skip(offset)
        .select(["name", "price", "quantity", "image"])
        .sort({ createdAt: "desc" });
    }
    const pagination = {
      totalPage:data.length,
      page,
      pageSize,
    };
    return { data, pagination };
  },
};
