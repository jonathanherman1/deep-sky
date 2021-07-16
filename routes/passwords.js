import { Router } from 'express';
import * as passwordsCtrl from '../controllers/passwords.js';

export {
    router
}

const router = Router();

router.get('/', passwordsCtrl.index);
router.get('/new', passwordsCtrl.new);
router.post('/', passwordsCtrl.create);