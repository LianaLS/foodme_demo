package am.foodme.backend.service;

import am.foodme.backend.dto.OrderDto;
import am.foodme.backend.dto.OrderReviewRequestDto;
import am.foodme.backend.exceptionHandler.BadRequestException;
import am.foodme.backend.exceptionHandler.ConflictException;
import am.foodme.backend.exceptionHandler.NotFoundException;
import am.foodme.backend.model.Chef;
import am.foodme.backend.model.Customer;
import am.foodme.backend.model.Order;
import am.foodme.backend.model.OrderReview;
import am.foodme.backend.repository.ChefRepository;
import am.foodme.backend.repository.CustomerRepository;
import am.foodme.backend.repository.OrderRepository;
import am.foodme.backend.repository.OrderReviewRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class OrderReviewService {

    static final String NOT_DELIVERED_MESSAGE = "Only delivered orders can be reviewed.";
    static final String ALREADY_REVIEWED_MESSAGE = "Order already reviewed.";

    private final OrderRepository orderRepository;
    private final OrderReviewRepository orderReviewRepository;
    private final CustomerRepository customerRepository;
    private final ChefRepository chefRepository;

    public OrderReviewService(OrderRepository orderRepository, OrderReviewRepository orderReviewRepository,
                              CustomerRepository customerRepository, ChefRepository chefRepository) {
        this.orderRepository = orderRepository;
        this.orderReviewRepository = orderReviewRepository;
        this.customerRepository = customerRepository;
        this.chefRepository = chefRepository;
    }

    @Transactional
    public OrderDto reviewOrder(String orderNumber, OrderReviewRequestDto request, String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail == null ? "" : customerEmail.trim().toLowerCase())
                .orElseThrow(() -> new NotFoundException("Customer not found"));

        // R7: someone else's order looks exactly like a missing one.
        Order order = orderRepository.findByNumber(orderNumber)
                .filter(o -> o.getCustomer() != null && o.getCustomer().getId().equals(customer.getId()))
                .orElseThrow(() -> new NotFoundException("Order " + orderNumber + " not found"));

        if (!"DELIVERED".equals(order.getStatus())) {
            throw new BadRequestException(NOT_DELIVERED_MESSAGE);
        }
        if (order.getReview() != null || orderReviewRepository.existsByOrderId(order.getId())) {
            throw new ConflictException(ALREADY_REVIEWED_MESSAGE);
        }

        OrderReview review = new OrderReview();
        review.setOrder(order);
        review.setCustomer(customer);
        review.setChef(order.getChef());
        review.setStars(request.getStars().intValueExact());
        review.setComment(normalizeComment(request.getComment()));
        review.setCreatedAt(LocalDateTime.now());

        try {
            orderReviewRepository.saveAndFlush(review);
        } catch (DataIntegrityViolationException e) {
            // Two concurrent submits for the same order: the unique order_id wins.
            throw new ConflictException(ALREADY_REVIEWED_MESSAGE);
        }
        order.setReview(review);

        updateChefRating(order.getChef());

        return OrderDto.mapEntityToDto(order);
    }

    /**
     * R10/R11: the chef's rating is the average of all their ratings, one decimal place.
     * SCRUM-8: the chef row is locked first, so parallel ratings are averaged one after another.
     */
    private void updateChefRating(Chef chef) {
        if (chef == null) {
            return;
        }
        chefRepository.findByIdForUpdate(chef.getId());
        Double average = orderReviewRepository.averageStarsForChef(chef.getId());
        if (average == null) {
            return;
        }
        double rating = BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP).doubleValue();
        // A direct UPDATE: the chef object loaded with the order may hold an outdated rating.
        chefRepository.updateRating(chef.getId(), rating);
    }

    private static String normalizeComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        return comment.trim();
    }
}
