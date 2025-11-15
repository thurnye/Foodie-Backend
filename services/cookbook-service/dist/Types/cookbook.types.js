"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperSize = exports.CookbookLayout = exports.CookbookStatus = exports.CookbookTheme = void 0;
var CookbookTheme;
(function (CookbookTheme) {
    CookbookTheme["MODERN"] = "modern";
    CookbookTheme["CLASSIC"] = "classic";
    CookbookTheme["RUSTIC"] = "rustic";
    CookbookTheme["MINIMALIST"] = "minimalist";
    CookbookTheme["ELEGANT"] = "elegant";
})(CookbookTheme || (exports.CookbookTheme = CookbookTheme = {}));
var CookbookStatus;
(function (CookbookStatus) {
    CookbookStatus["DRAFT"] = "draft";
    CookbookStatus["GENERATING"] = "generating";
    CookbookStatus["COMPLETED"] = "completed";
    CookbookStatus["FAILED"] = "failed";
})(CookbookStatus || (exports.CookbookStatus = CookbookStatus = {}));
var CookbookLayout;
(function (CookbookLayout) {
    CookbookLayout["SINGLE_COLUMN"] = "single-column";
    CookbookLayout["TWO_COLUMN"] = "two-column";
    CookbookLayout["MAGAZINE"] = "magazine";
})(CookbookLayout || (exports.CookbookLayout = CookbookLayout = {}));
var PaperSize;
(function (PaperSize) {
    PaperSize["A4"] = "A4";
    PaperSize["LETTER"] = "Letter";
    PaperSize["LEGAL"] = "Legal";
    PaperSize["A5"] = "A5";
})(PaperSize || (exports.PaperSize = PaperSize = {}));
//# sourceMappingURL=cookbook.types.js.map