import { PRICES, MAX_TICKETS_PER_PURCHASE, TICKET_TYPES } from '../constants.js';
import { InvalidPurchaseException } from './lib/InvalidPurchaseException.js';

/**
 * TicketService implementation.
 *
 * The constructor accepts the payment and seat reservation services for easy testing
 * (dependency injection). This avoids modifying any thirdparty code.
 */
export class TicketService {
  /**
   * @param {object} deps
   * @param {{makePayment: Function}} deps.paymentService
   * @param {{reserveSeat: Function}} deps.seatService
   */
  constructor({ paymentService, seatService } = {}) {
    if (!paymentService || !seatService) {
      throw new Error('TicketService requires paymentService and seatService');
    }
    this.paymentService = paymentService;
    this.seatService = seatService;
  }

  /**
   * Purchase tickets.
   * @param {number} accountId
   * @param  {...import('./lib/TicketTypeRequest.js').TicketTypeRequest} ticketTypeRequests
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Input validation
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('accountId must be a positive integer');
    }
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('At least one ticket must be requested');
    }

    // Aggregate counts
    const counts = {
      [TICKET_TYPES.ADULT]: 0,
      [TICKET_TYPES.CHILD]: 0,
      [TICKET_TYPES.INFANT]: 0,
    };

    for (const req of ticketTypeRequests) {
      if (!req || typeof req.getType !== 'function' || typeof req.getNoOfTickets !== 'function') {
        throw new InvalidPurchaseException('Invalid TicketTypeRequest provided');
      }
      const type = req.getType();
      const qty = req.getNoOfTickets();
      if (!Number.isInteger(qty) || qty < 0) {
        throw new InvalidPurchaseException('Ticket quantities must be non-negative integers');
      }
      counts[type] += qty;
    }

    const totalRequested = counts.ADULT + counts.CHILD + counts.INFANT;
    if (totalRequested === 0) {
      throw new InvalidPurchaseException('Total tickets cannot be zero');
    }
    if (totalRequested > MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(`Cannot purchase more than ${MAX_TICKETS_PER_PURCHASE} tickets in one transaction`);
    }

    // Business rules
    if ((counts.CHILD > 0 || counts.INFANT > 0) && counts.ADULT === 0) {
      throw new InvalidPurchaseException('Child and Infant tickets require at least one Adult ticket');
    }
    if (counts.INFANT > counts.ADULT) {
      // Optional stricter rule often expected: one lap per adult
      throw new InvalidPurchaseException('Each Infant must be accompanied by one Adult (one lap per Infant)');
    }

    // Calculate totals
    const paymentAmount = (counts.ADULT * PRICES.ADULT) + (counts.CHILD * PRICES.CHILD) + (counts.INFANT * PRICES.INFANT);
    const seatsToReserve = counts.ADULT + counts.CHILD; // Infants do not get a seat

    // Interact with external services
    this.paymentService.makePayment(accountId, paymentAmount);
    this.seatService.reserveSeat(accountId, seatsToReserve);

    return {
      accountId,
      totals: { ...counts, requested: totalRequested },
      paymentAmount,
      seatsToReserve,
    };
  }
}
