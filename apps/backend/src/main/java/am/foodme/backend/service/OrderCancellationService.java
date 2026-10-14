package am.foodme.backend.service;

import am.foodme.backend.dto.OrderDto;
import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Customer;
import am.foodme.backend.model.Order;
import am.foodme.backend.repository.CustomerRepository;
import am.foodme.backend.repository.OrderRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** SCRUM-9 Cancel order (KAN-12): the customer cancels their own order while it is still NEW. */
@Service
public class OrderCancellationService {

    static final String ONLY_NEW_MESSAGE = "Only new orders can be cancelled.";

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final MeterRegistry meterRegistry;

    public OrderCancellationService(OrderRepository orderRepository, CustomerRepository customerRepository,
                                    MeterRegistry meterRegistry) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.meterRegistry = meterRegistry;
    }

    @Transactional
    public OrderDto cancelOrder(String orderNumber, String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail == null ? "" : customerEmail.trim().toLowerCase())
                .orElseThrow(() -> new NotFoundException("Customer not found"));

        // Someone else's order looks exactly like a missing one.
        // The row lock makes a parallel "accept" from the kitchen wait, so the status read here is current.
        Order order = orderRepository.findByNumberForUpdate(orderNumber)
                .filter(o -> o.getCustomer() != null && o.getCustomer().getId().equals(customer.getId()))
                .orElseThrow(() -> new NotFoundException("Order " + orderNumber + " not found"));

        if (!"NEW".equals(order.getStatus())) {
            throw new BadRequestException(ONLY_NEW_MESSAGE);
        }
        order.setStatus("CANCELLED");
        Order saved = orderRepository.save(order);

        meterRegistry.counter("foodme.orders.cancelled").increment();

        return OrderDto.mapEntityToDto(saved);
    }
}
