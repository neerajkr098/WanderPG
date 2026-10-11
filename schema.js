const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required().max(200),
      description: joi.string().required().max(2000),
      location: joi.string().required().max(200),
      country: joi.string().required().max(100),
      price: joi.number().required().min(0),

      image: joi
        .object({
          url: joi.string().allow("", null),
        })
        .allow(null),
    })
    .required()
    .unknown(false),
}).unknown(false);

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required().max(1000),
    })
    .required()
    .unknown(false),
}).unknown(false);
