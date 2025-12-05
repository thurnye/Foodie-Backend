"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const libs_1 = require("@foodie/libs");
class FileStorageService {
    uploadsDir;
    baseUrl;
    constructor() {
        this.uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'pdfs');
        this.baseUrl = process.env.BASE_URL;
        if (!fs_1.default.existsSync(this.uploadsDir)) {
            fs_1.default.mkdirSync(this.uploadsDir, { recursive: true });
            libs_1.logger.info('📁 Created uploads directory', { path: this.uploadsDir });
        }
    }
    async savePdf(bookId, pdfBuffer) {
        try {
            const fileName = `book-${bookId}-${Date.now()}.pdf`;
            const filePath = path_1.default.join(this.uploadsDir, fileName);
            await fs_1.default.promises.writeFile(filePath, pdfBuffer);
            const fileUrl = `${this.baseUrl}/uploads/pdfs/${fileName}`;
            libs_1.logger.info('✅ PDF saved successfully', { fileName, fileUrl });
            return fileUrl;
        }
        catch (error) {
            libs_1.logger.error('❌ Error saving PDF', { error, bookId });
            throw error;
        }
    }
    async deletePdf(fileUrl) {
        try {
            const fileName = path_1.default.basename(fileUrl);
            const filePath = path_1.default.join(this.uploadsDir, fileName);
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
                libs_1.logger.info('✅ PDF deleted successfully', { fileName });
            }
        }
        catch (error) {
            libs_1.logger.error('❌ Error deleting PDF', { error, fileUrl });
            throw error;
        }
    }
    pdfExists(fileUrl) {
        try {
            const fileName = path_1.default.basename(fileUrl);
            const filePath = path_1.default.join(this.uploadsDir, fileName);
            return fs_1.default.existsSync(filePath);
        }
        catch (error) {
            libs_1.logger.error('❌ Error checking PDF existence', { error, fileUrl });
            return false;
        }
    }
}
exports.default = new FileStorageService();
//# sourceMappingURL=FileStorageService.js.map