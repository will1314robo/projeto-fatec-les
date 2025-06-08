"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const router = (0, express_1.Router)();
router.get("/", customer_controller_1.getCustomers);
router.post("/", customer_controller_1.createCustomer);
exports.default = router;
