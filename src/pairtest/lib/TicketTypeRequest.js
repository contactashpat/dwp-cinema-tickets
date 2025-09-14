import { TICKET_TYPES } from '../../constants.js';


/**
 * Immutable ticket type request.
 *
 * @example
 * const req = new TicketTypeRequest(TICKET_TYPES.ADULT, 3);
 */
export class TicketTypeRequest {
    #type;
    #noOfTickets;


    constructor(type, noOfTickets) {
        if (!Object.values(TICKET_TYPES).includes(type)) {
            throw new TypeError(`Unknown ticket type: ${type}`);
        }
        if (!Number.isInteger(noOfTickets) || noOfTickets < 0) {
            throw new TypeError('noOfTickets must be a non-negative integer');
        }
        this.#type = type;
        this.#noOfTickets = noOfTickets;
// Freeze for shallow immutability; private fields ensure deep immutability of primitives
        Object.freeze(this);
    }


    getType() {
        return this.#type;
    }


    getNoOfTickets() {
        return this.#noOfTickets;
    }
}