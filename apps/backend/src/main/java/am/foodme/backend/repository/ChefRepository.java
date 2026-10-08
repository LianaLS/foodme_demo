package am.foodme.backend.repository;

import am.foodme.backend.model.Chef;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChefRepository extends JpaRepository<Chef, Long> {
    Page<Chef> findByStatusOrderByPriorityIndexAscIdAsc(String status, Pageable pageable);

    Optional<Chef> findByUsername(String username);

    Page<Chef> findByUsernameContainingIgnoreCase(String q, Pageable pageable);

    /** Loads the chef and locks the row until the transaction ends (SCRUM-8). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Chef c where c.id = :id")
    Optional<Chef> findByIdForUpdate(@Param("id") Long id);

    @Modifying
    @Query("update Chef c set c.rating = :rating where c.id = :id")
    void updateRating(@Param("id") Long id, @Param("rating") Double rating);
}
