const joi = require("joi");

module.exports.listingSchema = joi
  .object({
    listing: joi
      .object({
        title: joi.string().required().max(200),
        description: joi.string().required().max(2000),
        location: joi.string().required().max(200),
        country: joi.string().required().max(100),
        price: joi.number().required().min(0),
        area: joi.string().allow("", null).max(100),
        rentMin: joi.number().min(0).allow(null),
        rentMax: joi.number().min(0).allow(null),
        roomTypes: joi.alternatives().try(
          joi.array().items(joi.string().valid("single", "double", "triple", "quad")),
          joi.string().valid("single", "double", "triple", "quad")
        ),
        foodOptions: joi.alternatives().try(
          joi.array().items(joi.string().valid("none", "veg", "nonveg", "both")),
          joi.string().valid("none", "veg", "nonveg", "both")
        ),
        facilities: joi.alternatives().try(
          joi.array().items(
            joi.string().valid(
              "wifi",
              "laundry",
              "parking",
              "furnished",
              "ac",
              "power_backup",
              "cctv",
              "housekeeping"
            )
          ),
          joi.string().valid(
            "wifi",
            "laundry",
            "parking",
            "furnished",
            "ac",
            "power_backup",
            "cctv",
            "housekeeping"
          )
        ),
        rules: joi.string().allow("", null).max(1000),
        image: joi
          .object({
            url: joi.string().allow("", null),
          })
          .allow(null),
      })
      .required()
      .unknown(false),
  })
  .unknown(false);

module.exports.reviewSchema = joi
  .object({
    review: joi
      .object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required().max(1000),
      })
      .required()
      .unknown(false),
  })
  .unknown(false);

module.exports.enquirySchema = joi
  .object({
    enquiry: joi
      .object({
        message: joi.string().required().min(10).max(500),
      })
      .required()
      .unknown(false),
  })
  .unknown(false);

module.exports.reportSchema = joi
  .object({
    report: joi
      .object({
        reason: joi
          .string()
          .required()
          .valid("fake", "wrong_price", "not_available", "inappropriate", "other"),
        details: joi.string().allow("", null).max(500),
      })
      .required()
      .unknown(false),
  })
  .unknown(false);
