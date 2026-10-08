package com.vehiclefinancehub.app

import com.google.common.truth.Truth.assertThat
import com.vehiclefinancehub.app.data.parser.DataParser
import org.junit.Test

class DataParserTest {

    @Test
    fun parseJson_structuredDatasetSchema_parsesSuccessfully() {
        val json = """
            {
              "datasetId": "test_cars",
              "title": "Test Car Grid",
              "category": "Cars",
              "version": 1,
              "columns": [
                { "key": "model", "label": "Model", "type": "text", "isPrimary": true },
                { "key": "price", "label": "Price", "type": "currency", "isPrimary": false }
              ],
              "rows": [
                { "model": "Tata Nexon", "price": "₹ 12,00,000" },
                { "model": "Hyundai Creta", "price": "₹ 15,00,000" }
              ]
            }
        """.trimIndent()

        val result = DataParser.parseJson(json, "test_cars")

        assertThat(result.isSuccess).isTrue()
        assertThat(result.previewRowCount).isEqualTo(2)
        assertThat(result.schema?.title).isEqualTo("Test Car Grid")
        assertThat(result.schema?.columns?.size).isEqualTo(2)
    }

    @Test
    fun parseJson_rawArrayFormat_infersColumnsAndParses() {
        val rawJsonArray = """
            [
              { "sNo": 1, "oem": "Maruti", "asset": "Swift", "segment": "Hatchback" },
              { "sNo": 2, "oem": "Hyundai", "asset": "Venue", "segment": "SUV" }
            ]
        """.trimIndent()

        val result = DataParser.parseJson(rawJsonArray, "approved_cars")

        assertThat(result.isSuccess).isTrue()
        assertThat(result.previewRowCount).isEqualTo(2)
        assertThat(result.schema?.columns?.any { it.key == "asset" }).isTrue()
    }

    @Test
    fun parseCsv_commaSeparatedText_parsesHeadersAndRows() {
        val csv = """
            Make,Model,Fuel,LTV
            Tata,Nexon,Petrol,90%
            Mahindra,Thar,Diesel,85%
        """.trimIndent()

        val result = DataParser.parseCsv(csv, "custom_cv", "Custom CV Grid")

        assertThat(result.isSuccess).isTrue()
        assertThat(result.previewRowCount).isEqualTo(2)
        assertThat(result.schema?.columns?.size).isEqualTo(4)
        assertThat(result.schema?.rows?.first()?.get("make")).isEqualTo("Tata")
    }

    @Test
    fun parseJson_malformedJson_returnsGracefulError() {
        val badJson = "{ invalid json without quotes }"
        val result = DataParser.parseJson(badJson, "bad")

        assertThat(result.isSuccess).isFalse()
        assertThat(result.errorMessage).isNotNull()
    }
}
