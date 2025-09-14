import { jest } from '@jest/globals';
import { TicketService } from '../src/pairtest/TicketService.js';
import { TicketTypeRequest } from '../src/pairtest/lib/TicketTypeRequest.js';
import { TICKET_TYPES } from '../src/constants.js';
import { InvalidPurchaseException } from '../src/pairtest/lib/InvalidPurchaseException.js';

const mkServices = () => {
    return {
        paymentService: { makePayment: jest.fn() },
        seatService: { reserveSeat: jest.fn() },
    };
};

describe('TicketService', () => {
    test('calculates payment and seats, and calls external services', () => {
        const deps = mkServices();
        const svc = new TicketService(deps);

        const result = svc.purchaseTickets(
            100,
            new TicketTypeRequest(TICKET_TYPES.ADULT, 2),
            new TicketTypeRequest(TICKET_TYPES.CHILD, 3),
            new TicketTypeRequest(TICKET_TYPES.INFANT, 1),
        );

        expect(result.paymentAmount).toBe((2 * 25) + (3 * 15) + (1 * 0));
        expect(result.seatsToReserve).toBe(2 + 3);

        expect(deps.paymentService.makePayment).toHaveBeenCalledWith(100, result.paymentAmount);
        expect(deps.seatService.reserveSeat).toHaveBeenCalledWith(100, result.seatsToReserve);
    });

    test('rejects if accountId invalid', () => {
        const deps = mkServices();
        const svc = new TicketService(deps);
        expect(() => svc.purchaseTickets(0, new TicketTypeRequest(TICKET_TYPES.ADULT, 1)))
            .toThrow(InvalidPurchaseException);
    });

    test('rejects if no tickets provided', () => {
        const deps = mkServices();
        const svc = new TicketService(deps);
        expect(() => svc.purchaseTickets(1)).toThrow(InvalidPurchaseException);
    });

    test('rejects if total > 25', () => {
        const deps = mkServices();
        const svc = new TicketService(deps);
        expect(() => svc.purchaseTickets(1,
            new TicketTypeRequest(TICKET_TYPES.ADULT, 20),
            new TicketTypeRequest(TICKET_TYPES.CHILD, 6)))
            .toThrow('Cannot purchase more than 25');
    });

    test('rejects children/infants without adult', () => {
        const deps = mkServices();
        const svc = new TicketService(deps);
        expect(() => svc.purchaseTickets(1, new TicketTypeRequest(TICKET_TYPES.CHILD, 1)))
            .toThrow('require at least one Adult');
        expect(() => svc.purchaseTickets(1, new TicketTypeRequest(TICKET_TYPES.INFANT, 1)))
            .toThrow('require at least one Adult');
    });

    test('rejects more infants than adults (one lap per adult)', () => {
        const deps = mkServices();
        const svc = new TicketService(deps);
        expect(() => svc.purchaseTickets(1,
            new TicketTypeRequest(TICKET_TYPES.ADULT, 1),
            new TicketTypeRequest(TICKET_TYPES.INFANT, 2)))
            .toThrow('one Adult');
    });

    test('TicketTypeRequest is immutable', () => {
        const req = new TicketTypeRequest(TICKET_TYPES.ADULT, 1);
        expect(Object.isFrozen(req)).toBe(true);
        expect(() => { req.nope = 3; }).toThrow();
    });
});
