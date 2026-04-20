package com.mufakkira.feature.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdOrderByRenewalAsc(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
