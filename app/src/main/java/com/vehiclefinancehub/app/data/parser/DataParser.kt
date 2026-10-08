package com.vehiclefinancehub.app.data.parser

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.vehiclefinancehub.app.data.model.DataColumn
import com.vehiclefinancehub.app.data.model.DatasetSchema
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DataParser {

    private val gson = Gson()

    data class ParseResult(
        val isSuccess: Boolean,
        val schema: DatasetSchema? = null,
        val previewRowCount: Int = 0,
        val errorMessage: String? = null
    )

    /**
     * Parses JSON string into a DatasetSchema.
     * Supports both structured DatasetSchema format and legacy raw JSON arrays.
     */
    fun parseJson(jsonString: String, targetDatasetId: String = "imported_dataset"): ParseResult {
        return try {
            val trimmed = jsonString.trim()
            if (trimmed.startsWith("{")) {
                // Structured DatasetSchema format
                val schema = gson.fromJson(trimmed, DatasetSchema::class.java)
                if (schema.rows.isEmpty() && (schema.sections == null || schema.sections.isEmpty())) {
                    ParseResult(false, null, 0, "JSON dataset has no rows or sections.")
                } else {
                    ParseResult(true, schema, schema.rows.size, null)
                }
            } else if (trimmed.startsWith("[")) {
                // Raw JSON Array of maps: [ {"oem": "Tata", ...}, ... ]
                val listType = object : TypeToken<List<Map<String, Any?>>>() {}.type
                val rows: List<Map<String, Any?>> = gson.fromJson(trimmed, listType)
                if (rows.isEmpty()) {
                    return ParseResult(false, null, 0, "JSON array is empty.")
                }

                // Infer columns from the first row keys
                val sampleRow = rows.first()
                val columns = sampleRow.keys.mapIndexed { index, key ->
                    DataColumn(
                        key = key,
                        label = key.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.ROOT) else it.toString() },
                        type = inferTypeFromValue(sampleRow[key]),
                        isPrimary = index <= 1,
                        isSortable = true,
                        isFilterable = true,
                        widthDp = 130
                    )
                }

                val schema = DatasetSchema(
                    datasetId = targetDatasetId,
                    title = targetDatasetId.replace("_", " ").uppercase(Locale.ROOT),
                    category = "Imported",
                    version = 1,
                    lastUpdated = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()),
                    description = "Custom imported dataset with ${rows.size} records",
                    columns = columns,
                    rows = rows
                )

                ParseResult(true, schema, rows.size, null)
            } else {
                ParseResult(false, null, 0, "Invalid JSON format: must start with { or [")
            }
        } catch (e: Exception) {
            ParseResult(false, null, 0, "JSON Parsing Error: ${e.localizedMessage}")
        }
    }

    /**
     * Parses CSV text into a DatasetSchema.
     */
    fun parseCsv(csvContent: String, targetDatasetId: String, title: String): ParseResult {
        return try {
            val lines = csvContent.lines().filter { it.isNotBlank() }
            if (lines.size < 2) {
                return ParseResult(false, null, 0, "CSV must contain at least a header row and one data row.")
            }

            val headers = parseCsvLine(lines.first())
            val columns = headers.mapIndexed { index, header ->
                DataColumn(
                    key = header.trim().replace(" ", "_").lowercase(Locale.ROOT),
                    label = header.trim(),
                    type = "text",
                    isPrimary = index <= 1,
                    isSortable = true,
                    isFilterable = true,
                    widthDp = 130
                )
            }

            val rows = mutableListOf<Map<String, Any?>>()
            for (i in 1 until lines.size) {
                val values = parseCsvLine(lines[i])
                val rowMap = mutableMapOf<String, Any?>()
                headers.forEachIndexed { idx, header ->
                    val key = header.trim().replace(" ", "_").lowercase(Locale.ROOT)
                    val value = if (idx < values.size) values[idx].trim() else ""
                    rowMap[key] = value
                }
                rows.add(rowMap)
            }

            val schema = DatasetSchema(
                datasetId = targetDatasetId,
                title = title,
                category = "Imported",
                version = 1,
                lastUpdated = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()),
                description = "Imported from CSV (${rows.size} rows)",
                columns = columns,
                rows = rows
            )

            ParseResult(true, schema, rows.size, null)
        } catch (e: Exception) {
            ParseResult(false, null, 0, "CSV Parsing Error: ${e.localizedMessage}")
        }
    }

    private fun parseCsvLine(line: String): List<String> {
        val result = mutableListOf<String>()
        var curVal = StringBuilder()
        var inQuotes = false
        for (ch in line) {
            if (ch == '\"') {
                inQuotes = !inQuotes
            } else if (ch == ',' && !inQuotes) {
                result.add(curVal.toString())
                curVal = StringBuilder()
            } else {
                curVal.append(ch)
            }
        }
        result.add(curVal.toString())
        return result
    }

    private fun inferTypeFromValue(value: Any?): String {
        if (value == null) return "text"
        val str = value.toString().trim()
        return when {
            str.startsWith("₹") || str.contains("Lakh", ignoreCase = true) || str.contains("Crore", ignoreCase = true) -> "currency"
            str.endsWith("%") -> "percentage"
            str.toDoubleOrNull() != null -> "number"
            str.equals("Approved", ignoreCase = true) || str.equals("Active", ignoreCase = true) || str.equals("Expired", ignoreCase = true) -> "status"
            str.startsWith("+91") || str.length == 10 && str.all { it.isDigit() } -> "phone"
            str.contains("@") && str.contains(".") -> "email"
            else -> "text"
        }
    }
}
