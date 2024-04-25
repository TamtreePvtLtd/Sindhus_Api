const mongoose = require("mongoose");
const ProductModel = require("../../database/models/product");


/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */



exports.getMyBag = async (req, res, next) => {
    const products = req.body;
    const result = [];
    let itemsPrice = 0; 
  
    try {
      if (products && products.length > 0) {
        for (const product of products) {
          const { productId, sizes } = product;
  
          const foundProduct = await ProductModel.findOne(
            { _id: productId },
            { posterURL: 1, title: 1, sizes: 1 }
          );
  
          if (foundProduct) {
            const productDetail = {
              _id: foundProduct._id,
              posterURL: foundProduct.posterURL,
              title: foundProduct.title,
              sizes: [],
            };
  
            sizes.sort((a, b) => b.size.localeCompare(a.size));
  
            let productTotalCount = 0; 
  
            for (const size of sizes) {
              if (size.qty > 0) {
                const foundSize = foundProduct.sizes.find(
                  (sizeObj) => sizeObj.size === size.size
                );
                if (foundSize) {
                  const sizePrizeTotal =
                    Number(foundSize.price) * Number(size.qty);
  
                  productDetail.sizes.push({
                    size: foundSize.size,
                    price: foundSize.price,
                    qty: size.qty,
                  });
  
                  productTotalCount += sizePrizeTotal; 
                }
              }
            }
  
            itemsPrice += productTotalCount;
            if (productDetail.sizes.length !== 0) {
              result.push({
                ...productDetail,
              });
            }
          }
        }
  
        res.json({
          result: result,
          itemsPrice: itemsPrice,
          itemsCount: result.length,
        });
      } else {
        res.json({
          result: [],
          itemsPrice: 0,
          itemsCount: 0,
        });
      }
    } catch (error) {
      error = new Error("No Product available");
      error.statusCode = 455;
      next(error);
    }
  };