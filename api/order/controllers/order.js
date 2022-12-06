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

  async updateStatusSuccess(ctx) {
    try {
      const { id } = ctx.params;
      const order = await strapi
        .query("order")
        .model.findOneAndUpdate(
          { _id: id, status: { $ne: "success" } },
          { status: "success" }
        )
        .select("bill");
      const products = order.bill[0].ref.products;

      for (let i = 0; i < products.length; i++) {
        await updateSoldProduct(
          products[i].ref.product._id,
          products[i].ref.quantity
        );
      }
      ctx.status = 200;
      return ctx.response;
    } catch (error) {
      return ctx.badRequest(error);
    }
  },

  async updateStatusCancel(ctx) {
    try {
      const { id } = ctx.params;
      const order = await strapi
        .query("order")
        .model.findOneAndUpdate(
          { _id: id, status: { $ne: "cancelled" } },
          { status: "cancelled" }
        )
        .select("bill");
      const products = order.bill[0].ref.products;

      for (let i = 0; i < products.length; i++) {
        await updateQuantityProduct(
          products[i].ref.product._id,
          0-parseInt(products[i].ref.quantity)
        );
      }
      ctx.status = 200;
      return ctx.response;
    } catch (error) {
      return ctx.badRequest(error);
    }
  },

  async orderByUserID(ctx) {
    try {
      const { userID } = ctx.request.body;
      const page = (await parseInt(ctx.query.page)) || 1;
      const pageSize = (await parseInt(ctx.query.pageSize)) || 20;
      const offset = (await (parseInt(page) - 1)) * parseInt(pageSize);
      strapi.log.debug("userID === ", userID);
      if (!userID) {
        throw new NotFoundError("userID is missing");
      }
      const orders = await strapi
        .query("order")
        .model.find({ userID: { $eq: userID } })
        .limit(pageSize)
        .skip(offset)
        .select(["price", "status", "createdAt", "updatedAt", "bill"]);

      const dataCount = await strapi
        .query("order")
        .model.find({ userID: { $eq: userID } })
        .countDocuments();
      const totalPage = await Math.ceil(dataCount / parseInt(pageSize));
      const pagination = {
        totalPage,
        page,
        pageSize,
        totalItem: orders.length,
      };
      return { data: orders, pagination };
    } catch (error) {
      return ctx.badRequest(error);
    }
  },
};
