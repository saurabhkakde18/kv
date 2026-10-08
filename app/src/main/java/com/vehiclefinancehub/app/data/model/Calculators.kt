package com.vehiclefinancehub.app.data.model

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.pow
import kotlin.math.roundToLong

object EmiCalculatorHelper {

    data class EmiResult(
        val monthlyEmi: Double,
        val totalInterest: Double,
        val totalPayment: Double,
        val principalPct: Float,
        val interestPct: Float,
        val schedule: List<AmortizationMonth>
    )

    data class AmortizationMonth(
        val month: Int,
        val openingBalance: Double,
        val emi: Double,
        val principal: Double,
        val interest: Double,
        val closingBalance: Double
    )

    fun calculateEmi(loanAmount: Double, annualRatePct: Double, tenureMonths: Int): EmiResult {
        if (loanAmount <= 0 || tenureMonths <= 0) {
            return EmiResult(0.0, 0.0, 0.0, 0f, 0f, emptyList())
        }

        val monthlyRate = (annualRatePct / 12.0) / 100.0

        val monthlyEmi = if (monthlyRate > 0.0) {
            val factor = (1.0 + monthlyRate).pow(tenureMonths.toDouble())
            (loanAmount * monthlyRate * factor) / (factor - 1.0)
        } else {
            loanAmount / tenureMonths.toDouble()
        }

        val totalPayment = monthlyEmi * tenureMonths
        val totalInterest = (totalPayment - loanAmount).coerceAtLeast(0.0)
        val principalPct = if (totalPayment > 0) (loanAmount / totalPayment).toFloat() else 1f
        val interestPct = if (totalPayment > 0) (totalInterest / totalPayment).toFloat() else 0f

        // Generate Amortization Schedule
        var balance = loanAmount
        val schedule = mutableListOf<AmortizationMonth>()

        for (m in 1..tenureMonths) {
            val interestPart = if (monthlyRate > 0) balance * monthlyRate else 0.0
            val principalPart = (monthlyEmi - interestPart).coerceAtMost(balance)
            val closingBalance = (balance - principalPart).coerceAtLeast(0.0)

            schedule.add(
                AmortizationMonth(
                    month = m,
                    openingBalance = balance,
                    emi = monthlyEmi,
                    principal = principalPart,
                    interest = interestPart,
                    closingBalance = closingBalance
                )
            )
            balance = closingBalance
        }

        return EmiResult(
            monthlyEmi = monthlyEmi,
            totalInterest = totalInterest,
            totalPayment = totalPayment,
            principalPct = principalPct,
            interestPct = interestPct,
            schedule = schedule
        )
    }

    fun formatIndianCurrency(amount: Double): String {
        return try {
            val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
            formatter.maximumFractionDigits = 0
            formatter.format(amount.roundToLong())
        } catch (e: Exception) {
            "₹ " + String.format(Locale.US, "%,.0f", amount)
        }
    }
}

object PayoutCalculatorHelper {

    data class PayoutResult(
        val loanAmount: Double,
        val basePayoutPct: Double,
        val bonusPct: Double,
        val totalPayoutPct: Double,
        val baseEarnings: Double,
        val bonusEarnings: Double,
        val totalEarnings: Double
    )

    fun calculatePayout(loanAmount: Double, basePayoutPct: Double, bonusPct: Double): PayoutResult {
        val totalPct = basePayoutPct + bonusPct
        val baseEarnings = (loanAmount * basePayoutPct) / 100.0
        val bonusEarnings = (loanAmount * bonusPct) / 100.0
        val totalEarnings = baseEarnings + bonusEarnings

        return PayoutResult(
            loanAmount = loanAmount,
            basePayoutPct = basePayoutPct,
            bonusPct = bonusPct,
            totalPayoutPct = totalPct,
            baseEarnings = baseEarnings,
            bonusEarnings = bonusEarnings,
            totalEarnings = totalEarnings
        )
    }
}
