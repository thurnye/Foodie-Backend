"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookController_1 = __importDefault(require("../controllers/BookController"));
const router = (0, express_1.Router)();
router.post('/', BookController_1.default.createBook);
router.get('/my', BookController_1.default.getMyBooks);
router.get('/:bookId/render-data', BookController_1.default.getBookForRendering);
router.get('/:bookId/generation-status', BookController_1.default.getGenerationStatus);
router.get('/:bookId', BookController_1.default.getBookById);
router.put('/:bookId', BookController_1.default.updateBook);
router.delete('/:bookId', BookController_1.default.deleteBook);
router.post('/:bookId/pages', BookController_1.default.addPage);
router.put('/:bookId/pages/reorder', BookController_1.default.reorderPages);
router.put('/:bookId/pages/:pageId', BookController_1.default.updatePage);
router.delete('/:bookId/pages/:pageId', BookController_1.default.deletePage);
router.post('/:bookId/publish', BookController_1.default.publishBook);
exports.default = router;
//# sourceMappingURL=book.routes.js.map