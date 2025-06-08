import { Router } from "express";
import { 
  createProduto, 
  getAllProdutos, 
  getProdutoById,
  updateProduto,
  deleteProduto 
} from "../controllers/produto.controller";
import upload from "../configMulter/uploadConfig"; 

const router = Router();

router.post("/createprod", upload.array('files'), createProduto);
router.get("/getprod", getAllProdutos);
router.get("/getprodid/:id", getProdutoById);
router.put("/editprod/:id", upload.fields([
    { name: 'imagensNovas', maxCount: 10 }, 
    { name: 'nome' },
    { name: 'preco' },
    { name: 'status' },
    { name: 'categoria' },
    { name: 'descricao' },
    { name: 'imagensExistentes[]' }, 
]), updateProduto);
router.delete("/deleteprod/:id", deleteProduto); 

export default router;
