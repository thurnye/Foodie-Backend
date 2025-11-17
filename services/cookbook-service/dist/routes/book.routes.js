"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookController_1 = __importDefault(require("../controllers/BookController"));
const router = (0, express_1.Router)();
router.post('/', BookController_1.default.createBook.bind(BookController_1.default));
router.get('/my', BookController_1.default.getMyBooks.bind(BookController_1.default));
router.get('/:bookId', BookController_1.default.getBookById.bind(BookController_1.default));
router.put('/:bookId', BookController_1.default.updateBook.bind(BookController_1.default));
router.delete('/:bookId', BookController_1.default.deleteBook.bind(BookController_1.default));
router.post('/:bookId/pages', BookController_1.default.addPage.bind(BookController_1.default));
router.put('/:bookId/pages/reorder', BookController_1.default.reorderPages.bind(BookController_1.default));
router.put('/:bookId/pages/:pageId', BookController_1.default.updatePage.bind(BookController_1.default));
router.delete('/:bookId/pages/:pageId', BookController_1.default.deletePage.bind(BookController_1.default));
router.post('/:bookId/publish', BookController_1.default.publishBook.bind(BookController_1.default));
exports.default = router;
//# sourceMappingURL=book.routes.js.map