package am.foodme.backend;

import am.foodme.backend.dto.DeliveryPriceRequestDto;
import am.foodme.backend.model.Chef;
import am.foodme.backend.repository.ChefRepository;
import am.foodme.backend.repository.CustomerRepository;
import am.foodme.backend.repository.DishRepository;
import am.foodme.backend.repository.OrderRepository;
import am.foodme.backend.service.OrderService;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Component test, boundary value analysis + decision table (ISTQB CTFL 4.2.2, 4.2.3).
 * Design: qa/03-design/ep-bva.md §4, decision-tables.md DT-1. Requirement: REQ-07.
 */
class OrderServiceDeliveryPriceTest {

    private OrderService service;

    @BeforeEach
    void setUp() {
        ChefRepository chefRepository = mock(ChefRepository.class);
        Chef chef = new Chef();
        chef.setId(24L);
        chef.setDeliveryPrice(500.0);
        chef.setFreeDeliveryFrom(5000.0);
        when(chefRepository.findById(24L)).thenReturn(Optional.of(chef));

        service = new OrderService(mock(OrderRepository.class), chefRepository,
                mock(DishRepository.class), mock(CustomerRepository.class), new SimpleMeterRegistry());
    }

    private double price(double subtotal, String method) {
        return service.calculateDeliveryPrice(new DeliveryPriceRequestDto(24L, subtotal, method)).getDeliveryPrice();
    }

    @ParameterizedTest(name = "DELIVERY, subtotal {0} -> {1}")
    @CsvSource({
            "0, 500",
            "4999, 500",
            "5001, 0",
    })
    void deliveryAroundThreshold(double subtotal, double expected) {
        assertEquals(expected, price(subtotal, "DELIVERY"));
    }

    // Known defect FM-BUG-03 (planted): the threshold uses > instead of >=.
    // Enable this test for confirmation testing once the defect is fixed.
    @Disabled("Known defect FM-BUG-03 — enable for confirmation testing after the fix")
    @Test
    void deliveryExactlyAtThresholdIsFree() {
        assertEquals(0.0, price(5000, "DELIVERY"));
    }

    @ParameterizedTest(name = "TAKEAWAY, subtotal {0} -> 0")
    @CsvSource({"1000", "6000"})
    void takeawayIsAlwaysFree(double subtotal) {
        assertEquals(0.0, price(subtotal, "TAKEAWAY"));
    }
}
