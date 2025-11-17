"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageType = exports.BookStatus = void 0;
var BookStatus;
(function (BookStatus) {
    BookStatus["DRAFT"] = "draft";
    BookStatus["PUBLISHED"] = "published";
    BookStatus["ARCHIVED"] = "archived";
})(BookStatus || (exports.BookStatus = BookStatus = {}));
var PageType;
(function (PageType) {
    PageType["COVER"] = "cover";
    PageType["INTRO"] = "intro";
    PageType["TOC"] = "toc";
    PageType["RECIPE"] = "recipe";
    PageType["NOTES"] = "notes";
    PageType["BACK_COVER"] = "backCover";
    PageType["EXTRA"] = "extra";
})(PageType || (exports.PageType = PageType = {}));
//# sourceMappingURL=book.types.js.map