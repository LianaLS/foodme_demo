package am.foodme.backend;

import am.foodme.backend.model.Order;
import am.foodme.backend.repository.ChefRepository;
import am.foodme.backend.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * SCRUM-7 Order Ratings — order-ratings.spec.md R1–R13.
 * Creates orders of its own, so the context is discarded afterwards: OrderControllerTest
 * relies on order numbering starting from FM-100001 in a fresh database.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class OrderReviewControllerTest {

    private static final long CHEF_1 = 1L;
    private static final long CHEF_1_DISH = 1L;
    // Chef 2 is used only by the chef-average test, so its ratings are predictable.
    private static final long CHEF_2 = 2L;
    private static final long CHEF_2_DISH = 3L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ChefRepository chefRepository;

    private String customerToken() throws Exception {
        String email = "review-test-" + UUID.randomUUID() + "@example.com";
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

    private String placeOrder(String token, long chefId, long dishId) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "chefId", chefId,
                "receiverName", "Ann",
                "receiverPhoneNumber", "+37491234567",
                "receiverEmail", "ann@example.com",
                "paymentType", "CASH",
                "deliveryMethod", "TAKEAWAY",
                "createOrderDishes", List.of(Map.of("dishId", dishId, "quantity", 1))
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

    private String deliveredOrder(String token, long chefId, long dishId) throws Exception {
        String number = placeOrder(token, chefId, dishId);
        setStatus(number, "DELIVERED");
        return number;
    }

    private ResultActions review(String token, String number, Object stars, String comment) throws Exception {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("stars", stars);
        body.put("comment", comment);
        var request = post("/api/customer/orders/" + number + "/review")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    @Test
    void deliveredOrder_canBeRated_andRatingIsShownWithTheOrder() throws Exception {
        String token = customerToken();
        String number = deliveredOrder(token, CHEF_1, CHEF_1_DISH);

        review(token, number, 4, "  Tasty and warm  ")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.number").value(number))
                .andExpect(jsonPath("$.review.stars").value(4))
                .andExpect(jsonPath("$.review.comment").value("Tasty and warm"))
                .andExpect(jsonPath("$.review.createdAt").exists());

        // R13 + R19: My Orders, tracking and admin all show the stored rating.
        mockMvc.perform(get("/api/customer/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list[0].review.stars").value(4));
        mockMvc.perform(get("/api/order/number/" + number))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review.comment").value("Tasty and warm"));
        Long id = orderRepository.findByNumber(number).orElseThrow().getId();
        mockMvc.perform(get("/admin/order/" + id).with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review.stars").value(4));
    }

    @Test
    void commentIsOptional() throws Exception {
        String token = customerToken();
        String number = deliveredOrder(token, CHEF_1, CHEF_1_DISH);

        review(token, number, 5, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review.stars").value(5))
                .andExpect(jsonPath("$.review.comment").doesNotExist());
    }

    @Test
    void secondRating_isRejectedWithAlreadyReviewed() throws Exception {
        String token = customerToken();
        String number = deliveredOrder(token, CHEF_1, CHEF_1_DISH);
        review(token, number, 3, null).andExpect(status().isOk());

        review(token, number, 5, "changed my mind")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Order already reviewed."));
    }

    @Test
    void notDeliveredOrders_cannotBeRated() throws Exception {
        String token = customerToken();
        for (String status : List.of("NEW", "ACCEPTED", "REJECTED")) {
            String number = placeOrder(token, CHEF_1, CHEF_1_DISH);
            setStatus(number, status);

            review(token, number, 5, null)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Only delivered orders can be reviewed."));
        }
    }

    @Test
    void someoneElsesOrder_looksLikeAMissingOrder() throws Exception {
        String owner = customerToken();
        String number = deliveredOrder(owner, CHEF_1, CHEF_1_DISH);

        review(customerToken(), number, 5, null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order " + number + " not found"));
        review(customerToken(), "FM-999999", 5, null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order FM-999999 not found"));
    }

    @Test
    void anonymousUser_cannotRate() throws Exception {
        String number = deliveredOrder(customerToken(), CHEF_1, CHEF_1_DISH);

        review(null, number, 5, null).andExpect(status().isUnauthorized());
    }

    @Test
    void starsOutsideOneToFiveWholeNumbers_areRefused() throws Exception {
        String token = customerToken();
        String number = deliveredOrder(token, CHEF_1, CHEF_1_DISH);

        for (Object stars : new Object[]{0, 6, -1, 4.5, null}) {
            review(token, number, stars, null)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Rating must be a whole number from 1 to 5"));
        }
        // Boundaries 1 and 5 are valid (checked on separate orders, one rating per order).
        review(token, number, 1, null).andExpect(status().isOk());
        review(token, deliveredOrder(token, CHEF_1, CHEF_1_DISH), 5, null).andExpect(status().isOk());
    }

    @Test
    void commentLength_boundaryIs1000Characters() throws Exception {
        String token = customerToken();
        String number = deliveredOrder(token, CHEF_1, CHEF_1_DISH);

        review(token, number, 4, "a".repeat(1001))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Comment must be at most 1000 characters"));
        review(token, number, 4, "a".repeat(1000)).andExpect(status().isOk());
    }

    @Test
    void chefRating_isAverageOfRatings_roundedToOneDecimal() throws Exception {
        String token = customerToken();

        review(token, deliveredOrder(token, CHEF_2, CHEF_2_DISH), 4, null).andExpect(status().isOk());
        review(token, deliveredOrder(token, CHEF_2, CHEF_2_DISH), 5, null).andExpect(status().isOk());
        assertEquals(4.5, chefRepository.findById(CHEF_2).orElseThrow().getRating());

        review(token, deliveredOrder(token, CHEF_2, CHEF_2_DISH), 4, null).andExpect(status().isOk());
        // (4 + 5 + 4) / 3 = 4.333… -> 4.3
        assertEquals(4.3, chefRepository.findById(CHEF_2).orElseThrow().getRating());
        mockMvc.perform(get("/api/chef/" + CHEF_2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4.3));
    }

    @Test
    void unratedOrder_hasNoReview() throws Exception {
        String token = customerToken();
        String number = deliveredOrder(token, CHEF_1, CHEF_1_DISH);

        mockMvc.perform(get("/api/order/number/" + number))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review").doesNotExist());
    }
}
