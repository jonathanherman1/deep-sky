import { Router } from "express";
import * as companiesCtrl from '../controllers/companies.js';

export {
    router
}

const router = Router();

router.get('/', companiesCtrl.index);
router.get('/new', companiesCtrl.new);
router.get('/:id', companiesCtrl.show);
router.post('/', companiesCtrl.create);
router.put('/:id', companiesCtrl.update);
router.delete('/:id', companiesCtrl.delete);