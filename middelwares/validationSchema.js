const { body } = require("express-validator");

const userRegisterValidationSchema = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("address.street").notEmpty().withMessage("Street address is required"),
    body("address.city").notEmpty().withMessage("City is required"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("username").notEmpty().withMessage("Username is required"),
    body("pass").notEmpty().withMessage("Password is required"),
  ];
};

module.exports = userRegisterValidationSchema;

const userLoginValidationSchema = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("pass").notEmpty().withMessage("Password is required"),
  ];
};

const supplierValidationSchema = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("logo").notEmpty().withMessage("Logo is required"),
    body("TaxNum").notEmpty().withMessage("TaxNum is required"),
    body("website").notEmpty().withMessage("Website is required"),
  ];
};

const productValidationSchema = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("image").notEmpty().withMessage("Image is required"),
    body("price").notEmpty().withMessage("Price is required"),
    body("quantity").notEmpty().withMessage("Quantity is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("colors").notEmpty().withMessage("Colors is required"),
    body("supplierId").notEmpty().withMessage("Supplier id is required"),
  ];
};

const cartValidationSchema = () => {
  return [
    body("productsId").notEmpty().withMessage("Product id is required"),
    body("count").notEmpty().withMessage("Count is required"),
  ];
};

module.exports = {
  userRegisterValidationSchema,
  userLoginValidationSchema,
  supplierValidationSchema,
  productValidationSchema,
  cartValidationSchema,
};
