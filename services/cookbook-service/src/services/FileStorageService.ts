import fs from 'fs';
import path from 'path';
import { logger } from '@foodie/libs';

class FileStorageService {
  private uploadsDir: string;
  private baseUrl: string;

  constructor() {
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3004';

    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      logger.info('📁 Created uploads directory', { path: this.uploadsDir });
    }
  }

  /**
   * Save PDF buffer to file system
   */
  async savePdf(bookId: string, pdfBuffer: Buffer): Promise<string> {
    try {
      const fileName = `book-${bookId}-${Date.now()}.pdf`;
      const filePath = path.join(this.uploadsDir, fileName);

      // Write PDF to file
      await fs.promises.writeFile(filePath, pdfBuffer);

      // Return public URL
      const fileUrl = `${this.baseUrl}/uploads/pdfs/${fileName}`;
      logger.info('✅ PDF saved successfully', { fileName, fileUrl });

      return fileUrl;
    } catch (error) {
      logger.error('❌ Error saving PDF', { error, bookId });
      throw error;
    }
  }

  /**
   * Delete PDF file
   */
  async deletePdf(fileUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadsDir, fileName);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info('✅ PDF deleted successfully', { fileName });
      }
    } catch (error) {
      logger.error('❌ Error deleting PDF', { error, fileUrl });
      throw error;
    }
  }

  /**
   * Check if PDF exists
   */
  pdfExists(fileUrl: string): boolean {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadsDir, fileName);
      return fs.existsSync(filePath);
    } catch (error) {
      logger.error('❌ Error checking PDF existence', { error, fileUrl });
      return false;
    }
  }
}

export default new FileStorageService();
