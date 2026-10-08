package com.vehiclefinancehub.app

import com.google.common.truth.Truth.assertThat
import com.vehiclefinancehub.app.data.model.PayoutCalculatorHelper
import org.junit.Test

class PayoutCalculatorTest {

    @Test
    fun calculatePayout_standardSlab_returnsCorrectEarnings() {
        val loanAmount = 5000000.0 // 50 Lakhs
        val basePct = 1.50
        val bonusPct = 0.25

        val result = PayoutCalculatorHelper.calculatePayout(loanAmount, basePct, bonusPct)

        assertThat(result.totalPayoutPct).isEqualTo(1.75)
        assertThat(result.baseEarnings).isEqualTo(75000.0) // 1.5% of 50L
        assertThat(result.bonusEarnings).isEqualTo(12500.0) // 0.25% of 50L
        assertThat(result.totalEarnings).isEqualTo(87500.0)
    }

    @Test
    fun calculatePayout_zeroBonus_calculatesBaseOnly() {
        val loanAmount = 1000000.0
        val basePct = 2.0
        val bonusPct = 0.0

        val result = PayoutCalculatorHelper.calculatePayout(loanAmount, basePct, bonusPct)

        assertThat(result.totalEarnings).isEqualTo(20000.0)
    }
}
