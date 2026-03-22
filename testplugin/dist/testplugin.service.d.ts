export declare class TestpluginService {
    private readonly logger;
    getStatus(): {
        status: string;
        printer: string;
    };
    printOrder(orderId: string, items: any[]): {
        success: boolean;
        message: string;
        timestamp: string;
    };
}
