import { Router } from "express";
import * as companiesCtrl from '../controllers/companies.js';

export {
    router
}

const router = Router();

router.get('/', companiesCtrl.index);
router.get('/new', companiesCtrl.new);
router.post('/', companiesCtrl.create);