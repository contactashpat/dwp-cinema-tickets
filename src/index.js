import { TICKET_TYPES } from './constants.js';
import {TicketService} from "./pairtest/TicketService.js";
import TicketPaymentService from "./thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "./thirdparty/seatbooking/SeatReservationService.js";
import {TicketTypeRequest} from "./pairtest/lib/TicketTypeRequest.js";

// For demo purposes I imported the local demo providers.
const paymentService = new TicketPaymentService();
const seatService = new SeatReservationService();
const ticketService = new TicketService({ paymentService, seatService });

try {
    const result = ticketService.purchaseTickets(
        14959478, // account id
        new TicketTypeRequest(TICKET_TYPES.ADULT, 2),
        new TicketTypeRequest(TICKET_TYPES.CHILD, 3),
        new TicketTypeRequest(TICKET_TYPES.INFANT, 1),
    );
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Demo completed successfully');
} catch (err) {
    console.error('❌ Demo failed:', err.message);
    process.exitCode = 1;
}