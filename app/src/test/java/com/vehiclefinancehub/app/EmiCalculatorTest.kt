package com.vehiclefinancehub.app

import com.google.common.truth.Truth.assertThat
import com.vehiclefinancehub.app.data.model.EmiCalculatorHelper
import org.junit.Test
import kotlin.math.roundToLong

class EmiCalculatorTest {

    @Test
    fun calculateEmi_standardCarLoan_returnsAccurateEmi() {
        // ₹ 10,00,000 at 9.0% for 60 months (5 years)
        val loanAmount = 1000000.0
        val annualRate = 9.0
        val tenureMonths = 60

        val result = EmiCalculatorHelper.calculateEmi(loanAmount, annualRate, tenureMonths)

        // Standard financial EMI formula should yield ~ ₹ 20,758 / month
        assertThat(result.monthlyEmi.roundToLong()).isEqualTo(20758L)
        assertThat(result.schedule.size).isEqualTo(60)

        // Last month closing balance should be approximately 0
        val finalMonth = result.schedule.last()
        assertThat(finalMonth.closingBalance.roundToLong()).isEqualTo(0L)
    }

    @Test
    fun calculateEmi_zeroInterest_returnsEqualPrincipalDivision() {
        val loanAmount = 120000.0
        val annualRate = 0.0
        val tenureMonths = 12

        val result = EmiCalculatorHelper.calculateEmi(loanAmount, annualRate, tenureMonths)

        assertThat(result.monthlyEmi).isEqualTo(10000.0)
        assertThat(result.totalInterest).isEqualTo(0.0)
        assertThat(result.totalPayment).isEqualTo(120000.0)
    }

    @Test
    fun calculateEmi_zeroOrNegativeAmount_returnsZeros() {
        val result = EmiCalculatorHelper.calculateEmi(0.0, 10.0, 36)
        assertThat(result.monthlyEmi).isEqualTo(0.0)
        assertThat(result.schedule).isEmpty()
    }

    @Test
    fun formatIndianCurrency_formatsCorrectly() {
        val formatted = EmiCalculatorHelper.formatIndianCurrency(1500000.0)
        assertThat(formatted).contains("15,00,000")
    }
}
