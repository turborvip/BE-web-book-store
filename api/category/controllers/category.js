const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async findOne(ctx) {
    const { slug } = ctx.params;

    const entity = await strapi
      .query("category")
      .model.find({ _id: slug, status: true });
    return sanitizeEntity(entity, { model: strapi.models.product });
  },
};
