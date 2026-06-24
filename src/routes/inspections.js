const router = require('express').Router();
const {
  getAll, getOne, create, update, submit,
  getDraft, checkDuplicate,
} = require('../controllers/inspectionController');

// These MUST be before /:id — otherwise Express treats "draft" and
// "check-duplicate" as ObjectId values and passes them to getOne/update.
router.get('/draft',            getDraft);
router.get('/check-duplicate',  checkDuplicate);

router.get('/',           getAll);
router.get('/:id',        getOne);
router.post('/',          create);
router.put('/:id',        update);
router.post('/:id/submit', submit);

module.exports = router;
