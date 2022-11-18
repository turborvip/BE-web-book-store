"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const updateQuantityProduct = async (idProduct, quantityBuy) => {
  const filter = { _id: idProduct };

  const product = await strapi
    .query("product")
    .model.findOne(filter)
    .select(["quantity"]);

  const newQuantity = parseInt(product.quantity) - parseInt(quantityBuy);
  if (newQuantity < 0) return false;

  const update = { $inc: { quantity: -parseInt(quantityBuy) } };

  await strapi
    .query("product")
    .model.findOneAndUpdate(filter, update, {})
    .select(["id"]);

  return true;
};

const updateSoldProduct = async (idProduct, quantityBuy) => {
  const filter = { _id: idProduct };

  const update = { $inc: { sold: parseInt(quantityBuy) } };

  await strapi.query("product").model.findOneAndUpdate(filter, update, {});
};

module.exports = {
  async create(ctx) {
    try {
      const { name, address, phone, price, bill, description } =
        ctx.request.body;
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
            return ctx.notImplemented({ error: "Don't enough product!" });
          }
        }
        entity = await strapi.services.order.create(ctx.request.body);
      }
      await sanitizeEntity(entity, { model: strapi.models.order });
      ctx.status = 200;
      return ctx.response;
    } catch (error) {
      return ctx.badRequest();
    }
  },
  async updateStatusDone(ctx) {
    try {
      const { id } = ctx.params;
      const order = await strapi
        .query("order")
        .model.findOneAndUpdate({ _id: id, status:{$ne:"done"} }, { status: "done" })
        .select("bill");
      const products = order.bill[0].ref.products

      for (let i = 0; i < products.length; i++) {
        await updateSoldProduct(products[i].ref.product._id, products[i].ref.quantity);
      }
      ctx.status = 200;
      return ctx.response;
    } catch (error) {
      return ctx.badRequest(error);
    }
  },
};
