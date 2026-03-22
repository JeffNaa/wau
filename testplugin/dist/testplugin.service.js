"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TestpluginService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestpluginService = void 0;
const common_1 = require("@nestjs/common");
let TestpluginService = TestpluginService_1 = class TestpluginService {
    constructor() {
        this.logger = new common_1.Logger(TestpluginService_1.name);
    }
    getStatus() {
        return {
            status: 'Online',
            printer: 'Testplugin Printer'
        };
    }
    printOrder(orderId, items) {
        this.logger.log(`🖨️ [Testplugin] Processing Request: ${orderId}`);
        return {
            success: true,
            message: `Request ${orderId} has been successfully tested.`,
            timestamp: new Date().toISOString()
        };
    }
};
exports.TestpluginService = TestpluginService;
exports.TestpluginService = TestpluginService = TestpluginService_1 = __decorate([
    (0, common_1.Injectable)()
], TestpluginService);
//# sourceMappingURL=testplugin.service.js.map