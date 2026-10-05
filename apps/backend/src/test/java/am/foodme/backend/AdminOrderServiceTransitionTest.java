package am.foodme.backend;

import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.model.Order;
import am.foodme.backend.repository.OrderRepository;
import am.foodme.backend.service.AdminOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Component test, state transition testing (ISTQB CTFL 4.2.4), all transitions coverage.
 * Design: qa/03-design/state-transitions.md ST-1, sequence S5. Requirement: REQ-16.
 */
class AdminOrderServiceTransitionTest {

    private OrderRepository orderRepository;
    private AdminOrderService service;
    private Order order;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        service = new AdminOrderService(orderRepository);
        order = new Order();
        order.setId(1L);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @ParameterizedTest(name = "{0} -> {1} is allowed")
    @CsvSource({
            "NEW, ACCEPTED",
            "NEW, REJECTED",
            "ACCEPTED, DELIVERED",
            "ACCEPTED, REJECTED",
    })
    void validTransitions(String from, String to) {
        order.setStatus(from);

        assertEquals(to, service.updateStatus(1L, to, "reason").getStatus());
        verify(orderRepository).save(order);
    }

    @ParameterizedTest(name = "{0} -> {1} is rejected")
    @CsvSource({
            "NEW, NEW",
            "NEW, DELIVERED",
            "ACCEPTED, NEW",
            "ACCEPTED, ACCEPTED",
            "REJECTED, NEW",
            "REJECTED, ACCEPTED",
            "REJECTED, REJECTED",
            "REJECTED, DELIVERED",
            "DELIVERED, NEW",
            "DELIVERED, ACCEPTED",
            "DELIVERED, REJECTED",
            "DELIVERED, DELIVERED",
            "NEW, CANCELLED",
    })
    void invalidTransitions(String from, String to) {
        order.setStatus(from);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> service.updateStatus(1L, to, null));
        assertEquals("Cannot transition order from " + from + " to " + to, ex.getMessage());
        assertEquals(from, order.getStatus());
        verify(orderRepository, never()).save(any());
    }

    @ParameterizedTest(name = "reject reason is stored only for {0}")
    @CsvSource({"REJECTED, too late", "ACCEPTED, "})
    void rejectReasonOnlyForRejected(String to, String expectedReason) {
        order.setStatus("NEW");

        service.updateStatus(1L, to, "too late");

        assertEquals(expectedReason, order.getRejectReason());
    }
}
