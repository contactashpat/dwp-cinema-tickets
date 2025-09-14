# Cinema Tickets – Node.js Solution
- Optional stricter rule: not more Infants than Adults (one lap per adult)
- Infants have no cost and no seat
- Seats reserved = Adults + Children
- Payment = `Adults*25 + Children*15`
- **Testability**: The `TicketService` takes `paymentService` and `seatService` via constructor injection. In production, pass the provided third‑party services; in tests, we inject mocks.


## Third‑party services
The exercise template provides two services we do **not** modify:

- `TicketPaymentService.makePayment(accountId, amount)`
- `SeatReservationService.reserveSeat(accountId, seats)`


In your runtime wiring, instantiate these and pass them to `TicketService`:

```js
import {TicketService} from './TicketService.js';
import {TicketTypeRequest} from './TicketTypeRequest.js';
import {TICKET_TYPES} from './src/constants.js';
// Update the import paths below to match the template you received
import TicketPaymentService from './thirdparty/payment/TicketPaymentService.js';
import SeatReservationService from './thirdparty/seat/SeatReservationService.js';


const service = new TicketService({
    paymentService: new TicketPaymentService(),
    seatService: new SeatReservationService(),
});


service.purchaseTickets(123,
    new TicketTypeRequest(TICKET_TYPES.ADULT, 2),
    new TicketTypeRequest(TICKET_TYPES.CHILD, 1),
);
```


> **Note**: The exact `thirdparty` import paths can differ by template. If your paths differ, just adjust the two imports above; no other code changes are needed.


## Why this design?


- Small, intention‑revealing modules
- Clear, deterministic validation with explicit exceptions
- 100% unit test coverage on business logic
- No mutation of the third‑party packages, honoring constraints


## Acceptance Criteria mapping


- ✅ Calculates correct payment and seats
- ✅ Calls external payment and seat services
- ✅ Enforces business rules (max 25, adult required, infants lap‑seated)
- ✅ Rejects invalid inputs early with `InvalidPurchaseException`
- ✅ `TicketTypeRequest` is immutable


