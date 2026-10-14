package am.foodme.backend;

import am.foodme.backend.model.Order;
import am.foodme.backend.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * SCRUM-9 Cancel order (KAN-12) — cancel-order.spec.md, "Done when" cases.
 * Creates orders of its own in a separate in-memory database: the shared one keeps its
 * order_number_seq between contexts, and OrderControllerTest relies on numbering starting
 * from FM-100001.
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:foodme-cancel;DB_CLOSE_DELAY=-1;MODE=PostgreSQL")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class OrderCancellationControllerTest {

    private static final long CHEF_1 = 1L;
    private static final long CHEF_1_DISH = 1L;
    private static final String ONLY_NEW = "Only new orders can be cancelled.";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MeterRegistry meterRegistry;

    private String customerToken() throws Exception {
        String email = "cancel-test-" + UUID.randomUUID() + "@example.com";
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Ann",
                                "email", email,
                                "phoneNumber", "+37491234567",
                                "password", "secret123"
                        ))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    private String placeOrder(String token) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "chefId", CHEF_1,
                "receiverName", "Ann",
                "receiverPhoneNumber", "+37491234567",
                "receiverEmail", "ann@example.com",
                "paymentType", "CASH",
                "deliveryMethod", "TAKEAWAY",
                "createOrderDishes", List.of(Map.of("dishId", CHEF_1_DISH, "quantity", 1))
        ));
        String response = mockMvc.perform(post("/api/order")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("number").asText();
    }

    private void setStatus(String number, String status) {
        Order order = orderRepository.findByNumber(number).orElseThrow();
        order.setStatus(status);
        orderRepository.save(order);
    }

    private ResultActions cancel(String token, String number) throws Exception {
        var request = post("/api/customer/orders/" + number + "/cancel");
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private double cancelledCount() {
        return meterRegistry.counter("foodme.orders.cancelled").count();
    }

    @Test
    void owner_cancelsNewOrder_andItIsCancelledEverywhere() throws Exception {
        String token = customerToken();
        String number = placeOrder(token);
        double before = cancelledCount();

        cancel(token, number)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.number").value(number))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        assertEquals("CANCELLED", orderRepository.findByNumber(number).orElseThrow().getStatus());
        assertEquals(before + 1, cancelledCount());
        // AC-3: My Orders, tracking and the admin panel read the same status.
        mockMvc.perform(get("/api/customer/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list[0].status").value("CANCELLED"));
        mockMvc.perform(get("/api/order/number/" + number))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void acceptedOrder_cannotBeCancelled() throws Exception {
        String token = customerToken();
        String number = placeOrder(token);
        setStatus(number, "ACCEPTED");
        double before = cancelledCount();

        cancel(token, number)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(ONLY_NEW));

        assertEquals("ACCEPTED", orderRepository.findByNumber(number).orElseThrow().getStatus());
        assertEquals(before, cancelledCount());
    }

    @Test
    void ordersPastReceived_cannotBeCancelled() throws Exception {
        String token = customerToken();
        for (String status : List.of("DELIVERED", "REJECTED", "CANCELLED")) {
            String number = placeOrder(token);
            setStatus(number, status);

            cancel(token, number)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(ONLY_NEW));
            assertEquals(status, orderRepository.findByNumber(number).orElseThrow().getStatus());
        }
    }

    @Test
    void someoneElsesOrder_looksLikeAMissingOrder() throws Exception {
        String number = placeOrder(customerToken());

        cancel(customerToken(), number)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order " + number + " not found"));
        cancel(customerToken(), "FM-999999")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order FM-999999 not found"));

        assertEquals("NEW", orderRepository.findByNumber(number).orElseThrow().getStatus());
    }

    @Test
    void visitorWhoIsNotSignedIn_cannotCancel() throws Exception {
        String number = placeOrder(customerToken());

        cancel(null, number).andExpect(status().isUnauthorized());

        assertEquals("NEW", orderRepository.findByNumber(number).orElseThrow().getStatus());
    }

    @Test
    void admin_cannotChangeACancelledOrder() throws Exception {
        String token = customerToken();
        String number = placeOrder(token);
        cancel(token, number).andExpect(status().isOk());
        Long id = orderRepository.findByNumber(number).orElseThrow().getId();

        for (String target : List.of("NEW", "ACCEPTED", "DELIVERED", "REJECTED")) {
            mockMvc.perform(patch("/admin/order/" + id + "/status")
                            .with(user("admin").roles("ADMIN"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("status", target))))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Cannot transition order from CANCELLED to " + target));
        }

        assertEquals("CANCELLED", orderRepository.findByNumber(number).orElseThrow().getStatus());
        mockMvc.perform(get("/admin/order").param("status", "CANCELLED").param("size", "100")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list[?(@.number == '" + number + "')].status").value("CANCELLED"));
    }
}
