"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const updateQuantityProduct = async (idProduct, quantityBuy) => {
  const product = await strapi
    .query("product")
    .model.findOne({ _id: idProduct })
    .select(["quantity"]);

  const newQuantity = parseInt(product.quantity) - parseInt(quantityBuy);

  if (newQuantity < 0) return false;

  await strapi
    .query("product")
    .model.updateOne({ quantity: product.quantity - quantityBuy })
    .select(["id"]);

  return true;
};

module.exports = {
  async create(ctx) {
    const { name, address, phone, price, bill, description } = ctx.request.body;
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.order.create(data, { files });
    } else {

      for (let i = 0; i < bill.products.length; i++) {
        const updateQuantity = await updateQuantityProduct(
          bill.products[i].product,
          bill.products[i].quantity
        );
        if (!updateQuantity) {
          return {
            status: 400,
            msg: "Don't enough product!",
          };
        }
      }
      entity = await strapi.services.order.create(ctx.request.body);

    }
    return await sanitizeEntity(entity, { model: strapi.models.order });
  },
};
