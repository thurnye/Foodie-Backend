"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EventController_1 = __importDefault(require("../controllers/EventController"));
const router = (0, express_1.Router)();
router.get('/', EventController_1.default.getAllEvents);
router.get('/my-events', EventController_1.default.getMyEvents);
router.get('/organized', EventController_1.default.getOrganizedEvents);
router.get('/:eventId', EventController_1.default.getEventById);
router.post('/', EventController_1.default.createEvent);
router.put('/:eventId', EventController_1.default.updateEvent);
router.delete('/:eventId', EventController_1.default.deleteEvent);
router.post('/:eventId/register', EventController_1.default.registerForEvent);
router.delete('/:eventId/register', EventController_1.default.cancelRegistration);
exports.default = router;
//# sourceMappingURL=event.routes.js.map