"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = exports.getCustomers = void 0;
const connection_1 = __importDefault(require("../database/connection"));
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield connection_1.default.query("SELECT * FROM customers");
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao buscar clientes" });
    }
});
exports.getCustomers = getCustomers;
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price } = req.body;
    try {
        yield connection_1.default.query("INSERT INTO customers (name, price) VALUES (?, ?)", [
            name,
            price,
        ]);
        res.status(201).json({ message: "Cliente criado com sucesso" });
    }
    catch (error) {
        res.status(500).json({ message: "Erro ao criar cliente" });
    }
});
exports.createCustomer = createCustomer;
