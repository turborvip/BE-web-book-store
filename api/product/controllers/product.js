const { sanitizeEntity, convertRestQueryParams } = require("strapi-utils");

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
    const page =  parseInt(ctx.query.page) || 1;
    const pageSize =  parseInt(ctx.query.pageSize) || 20;

    const productCount = await strapi.query("product").model.count();
    let offset = await (parseInt(page) - 1) * parseInt(pageSize);
    let totalPage = await Math.ceil(productCount / parseInt(pageSize));
    const data = await strapi
      .query("product")
      .model.find({ status: 1 })
      .select(["name", "price", "quantity", "image"])
      .limit(parseInt(pageSize))
      .skip(offset)
      .sort({'sold':'desc'})
      const pagination = {
        totalPage,
        page,
        pageSize,
      }
    return {data,pagination}
  },
};
