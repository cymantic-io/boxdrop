package io.cymantic.boxdrop.jobs

import io.cymantic.boxdrop.listings.ListingRepository
import io.cymantic.boxdrop.sales.SaleRepository
import io.micronaut.scheduling.annotation.Scheduled
import jakarta.inject.Singleton
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Duration
import java.time.Instant

@Singleton
class PriceDecayJob(
    private val saleRepository: SaleRepository,
    private val listingRepository: ListingRepository
) {
    @Scheduled(fixedDelay = "5m")
    fun decayPrices() {
        val now = Instant.now()
        for (sale in saleRepository.findByStatus("ACTIVE")) {
            if (now.isAfter(sale.endsAt)) {
                saleRepository.update(sale.copy(status = "ENDED", updatedAt = now))
                continue
            }
            val totalMinutes = Duration.between(sale.startsAt, sale.endsAt).toMinutes().toDouble()
            val elapsed = Duration.between(sale.startsAt, now).toMinutes().toDouble()
            if (totalMinutes <= 0 || elapsed < 0) continue
            val progress = (elapsed / totalMinutes).coerceIn(0.0, 1.0)

            for (listing in listingRepository.findBySaleIdAndStatus(sale.id, "AVAILABLE")) {
                val range = listing.startingPrice.subtract(listing.minimumPrice)
                val decay = range.multiply(BigDecimal(progress)).setScale(2, RoundingMode.HALF_UP)
                val newPrice = listing.startingPrice.subtract(decay).max(listing.minimumPrice)
                if (newPrice.compareTo(listing.currentPrice) != 0) {
                    listingRepository.updatePrice(listing.id, newPrice)
                }
            }
        }
    }
}
