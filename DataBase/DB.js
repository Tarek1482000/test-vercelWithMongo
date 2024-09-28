let customersDB = [
  {
    id: 1,
    name: "Tarek Ahmed",
    phone: "01068063439",
    address: "10th",
    email: "tarek@gmail",
    username: "Tarek",
    pass: "Tarek1",
    cartId: 1,
    ordersId: [],
  },
];

let adminsDB = [
  {
    id: 1,
    name: "Tarek Ahmed",
    phone: "01068063439",
    address: "10th",
    email: "tarek@gmail",
    username: "Tarek",
    pass: "Tarek1",
    role: "ADMIN",
  },
];

let suppliersDB = [
  {
    id: 1,
    name: "Tarek Ahmed Supp",
    phone: "010",
    address: "10th",
    email: "tarekSupp@gmail",
    logo: "None",
    TaxNum: "12",
    website: "http//:1",
    productsId: [1],
  },
];

let productsDB = [
  {
    id: 1,
    name: "samasung ultra",
    description: "good phone",
    image: "none",
    price: 1000,
    quantity: 1,
    category: "phone",
    colors: ["white", "Black"],
    supplierId: 1,
  },
];

let ordersDB = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    state: "In progress",
    tracking: "In the way",
  },
];

let cartsDB = [
  {
    id: 1,
    userId: 1,
    productsId: [],
  },
];

module.exports = {
  adminsDB,
  customersDB,
  suppliersDB,
  productsDB,
  ordersDB,
  cartsDB,
};
