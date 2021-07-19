import { Router } from 'express';
import * as passwordsCtrl from '../controllers/passwords.js';

export {
    router
}

const router = Router();

router.get('/', passwordsCtrl.index);
router.get('/new', passwordsCtrl.new);
router.get('/:id', passwordsCtrl.show);
router.post('/:id/decrypt', passwordsCtrl.decrypt);
router.post('/', passwordsCtrl.create);