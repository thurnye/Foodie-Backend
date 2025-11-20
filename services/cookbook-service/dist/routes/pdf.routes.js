"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PdfController_1 = __importDefault(require("../controllers/PdfController"));
const router = (0, express_1.Router)();
router.post('/generate-book/:bookId', PdfController_1.default.generateBookPdf);
router.post('/generate-page/:bookId/:pageId', PdfController_1.default.generatePagePdf);
router.get('/status/:bookId', PdfController_1.default.getPdfStatus);
exports.default = router;
//# sourceMappingURL=pdf.routes.js.map