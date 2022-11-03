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
      .select(["name", "price", "image"])
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
    let { slug } = ctx.params;
    const category = ctx.query.category || null;
    const brands =ctx.query.brands || null;
    const priceFrom = ctx.query.priceFrom || 0;
    const priceTo = ctx.query.priceTo || 1000000;
    const page = await parseInt(ctx.query.page) || 1;
    const pageSize = await parseInt(ctx.query.pageSize) || 20;
    let offset = (await (parseInt(page) - 1) * parseInt(pageSize));
    strapi.log.debug('brands ==',brands,typeof brands)
    let data = [];
    if (category) {
      slug = await strapi
        .query("category")
        .model.find({ name: category, status: true })
        .select(["id"]);
    }
    if (brands) {
      data = await strapi
        .query("product")
        .model.find({
          categories: { $elemMatch: { $eq: slug } },
          price: { $gt: priceFrom, $lt: priceTo },
          brand: { $in: brands },
          status: true,
        })
        .limit(pageSize)
        .skip(offset)
        .select(["name", "price", "image"])
        .sort({ createdAt: "desc" });
    } else {
      data = await strapi
        .query("product")
        .model.find({
          categories: { $elemMatch: { $eq: slug } },
          price: { $gt: priceFrom, $lt: priceTo },
          status: true,
        })
        .limit(pageSize)
        .skip(offset)
        .select(["name", "price", "image"])
        .sort({ createdAt: "desc" });
    }
    const pagination = {
      totalPage: data.length,
      page,
      pageSize,
    };
    return { data, pagination };
  },
};
