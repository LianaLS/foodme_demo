package am.foodme.backend.repository;

import am.foodme.backend.model.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByNumber(String number);

    /** SCRUM-9: cancel and admin status changes lock the row, so they run one after another. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.number = :number")
    Optional<Order> findByNumberForUpdate(@Param("number") String number);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    Page<Order> findByStatus(String status, Pageable pageable);

    Page<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    @Query(value = "SELECT nextval('foodme.order_number_seq')", nativeQuery = true)
    long nextOrderNumberSequenceValue();
}
