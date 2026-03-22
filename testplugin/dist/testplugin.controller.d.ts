import { TestpluginService } from './testplugin.service';
export declare class TestpluginController {
    private readonly testpluginService;
    constructor(testpluginService: TestpluginService);
    getStatus(): {
        status: string;
        printer: string;
    };
    printOrder(body: {
        orderId: string;
        items: any[];
    }): {
        success: boolean;
        message: string;
        timestamp: string;
    };
}
