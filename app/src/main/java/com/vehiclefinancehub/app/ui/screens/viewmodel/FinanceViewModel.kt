package com.vehiclefinancehub.app.ui.screens.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.vehiclefinancehub.app.data.local.DataStoreManager
import com.vehiclefinancehub.app.data.local.FavoriteEntity
import com.vehiclefinancehub.app.data.local.RecentSearchEntity
import com.vehiclefinancehub.app.data.model.DatasetSchema
import com.vehiclefinancehub.app.data.model.EmiCalculatorHelper
import com.vehiclefinancehub.app.data.model.GroupedSearchResult
import com.vehiclefinancehub.app.data.model.PayoutCalculatorHelper
import com.vehiclefinancehub.app.data.model.SearchCategoryFilter
import com.vehiclefinancehub.app.data.parser.DataParser
import com.vehiclefinancehub.app.data.repository.FinanceRepository
import com.vehiclefinancehub.app.di.ServiceLocator
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FinanceViewModel @Inject constructor(
    private val repository: FinanceRepository,
    private val dataStoreManager: DataStoreManager
) : ViewModel() {

    // Tab Navigation State
    private val _selectedTabIndex = MutableStateFlow(0)
    val selectedTabIndex: StateFlow<Int> = _selectedTabIndex.asStateFlow()

    // Global Search State
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchFilter = MutableStateFlow(SearchCategoryFilter.ALL)
    val searchFilter: StateFlow<SearchCategoryFilter> = _searchFilter.asStateFlow()

    private val _searchResults = MutableStateFlow<List<GroupedSearchResult>>(emptyList())
    val searchResults: StateFlow<List<GroupedSearchResult>> = _searchResults.asStateFlow()

    private val _isSearching = MutableStateFlow(false)
    val isSearching: StateFlow<Boolean> = _isSearching.asStateFlow()

    private var searchJob: Job? = null

    // Datasets
    val allDatasets: StateFlow<List<DatasetSchema>> = repository.getAllDatasetsFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Favorites & Recent Searches
    val favorites: StateFlow<List<FavoriteEntity>> = repository.getFavoritesFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteIds: StateFlow<List<String>> = repository.getFavoriteIdsFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val recentSearches: StateFlow<List<RecentSearchEntity>> = repository.getRecentSearchesFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Settings Flows
    val themeMode: StateFlow<String> = dataStoreManager.themeModeFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "DARK")

    val isAppLockEnabled: StateFlow<Boolean> = dataStoreManager.isAppLockEnabledFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val appLockPin: StateFlow<String?> = dataStoreManager.appLockPinFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val isBiometricEnabled: StateFlow<Boolean> = dataStoreManager.isBiometricEnabledFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val isFlagSecureEnabled: StateFlow<Boolean> = dataStoreManager.isFlagSecureEnabledFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val dataVersion: StateFlow<Int> = dataStoreManager.dataVersionFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 1)

    val lastUpdated: StateFlow<String> = dataStoreManager.lastUpdatedFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "2026-10-07")

    // App Lock Authenticated State
    private val _isAppUnlocked = MutableStateFlow(false)
    val isAppUnlocked: StateFlow<Boolean> = _isAppUnlocked.asStateFlow()

    // EMI Calculator State
    private val _emiLoanAmount = MutableStateFlow(800000.0)
    val emiLoanAmount: StateFlow<Double> = _emiLoanAmount.asStateFlow()

    private val _emiInterestRate = MutableStateFlow(9.25)
    val emiInterestRate: StateFlow<Double> = _emiInterestRate.asStateFlow()

    private val _emiTenureMonths = MutableStateFlow(60)
    val emiTenureMonths: StateFlow<Int> = _emiTenureMonths.asStateFlow()

    private val _emiResult = MutableStateFlow(
        EmiCalculatorHelper.calculateEmi(800000.0, 9.25, 60)
    )
    val emiResult: StateFlow<EmiCalculatorHelper.EmiResult> = _emiResult.asStateFlow()

    // DSA Payout Calculator State
    private val _payoutLoanAmount = MutableStateFlow(1000000.0)
    val payoutLoanAmount: StateFlow<Double> = _payoutLoanAmount.asStateFlow()

    private val _payoutBasePct = MutableStateFlow(1.50)
    val payoutBasePct: StateFlow<Double> = _payoutBasePct.asStateFlow()

    private val _payoutBonusPct = MutableStateFlow(0.20)
    val payoutBonusPct: StateFlow<Double> = _payoutBonusPct.asStateFlow()

    private val _payoutResult = MutableStateFlow(
        PayoutCalculatorHelper.calculatePayout(1000000.0, 1.50, 0.20)
    )
    val payoutResult: StateFlow<PayoutCalculatorHelper.PayoutResult> = _payoutResult.asStateFlow()

    // Document Checklist Checked Items (docKey -> Boolean)
    private val _checkedDocs = MutableStateFlow<Map<String, Boolean>>(emptyMap())
    val checkedDocs: StateFlow<Map<String, Boolean>> = _checkedDocs.asStateFlow()

    // Import Preview State
    private val _importPreview = MutableStateFlow<DataParser.ParseResult?>(null)
    val importPreview: StateFlow<DataParser.ParseResult?> = _importPreview.asStateFlow()

    private val _importStatusMessage = MutableStateFlow<String?>(null)
    val importStatusMessage: StateFlow<String?> = _importStatusMessage.asStateFlow()

    init {
        viewModelScope.launch {
            repository.initializeDatabaseIfNeeded()
        }
    }

    fun setSelectedTabIndex(index: Int) {
        _selectedTabIndex.value = index
    }

    fun setAppUnlocked(unlocked: Boolean) {
        _isAppUnlocked.value = unlocked
    }

    // ================= Search Logic with 250ms Debounce =================
    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
        searchJob?.cancel()
        if (query.isBlank()) {
            _searchResults.value = emptyList()
            _isSearching.value = false
            return
        }

        searchJob = viewModelScope.launch {
            _isSearching.value = true
            delay(250) // 250ms debounce
            val results = repository.search(query, _searchFilter.value)
            _searchResults.value = results
            _isSearching.value = false
        }
    }

    fun onSearchFilterChanged(filter: SearchCategoryFilter) {
        _searchFilter.value = filter
        if (_searchQuery.value.isNotBlank()) {
            viewModelScope.launch {
                _isSearching.value = true
                val results = repository.search(_searchQuery.value, filter)
                _searchResults.value = results
                _isSearching.value = false
            }
        }
    }

    fun addRecentSearch(query: String) {
        viewModelScope.launch {
            repository.addRecentSearch(query)
        }
    }

    fun deleteRecentSearch(query: String) {
        viewModelScope.launch {
            repository.deleteRecentSearch(query)
        }
    }

    fun clearRecentSearches() {
        viewModelScope.launch {
            repository.clearRecentSearches()
        }
    }

    // ================= Favorites =================
    fun toggleFavorite(
        id: String,
        datasetId: String,
        datasetTitle: String,
        primaryTitle: String,
        secondaryText: String,
        rowJson: String
    ) {
        viewModelScope.launch {
            repository.toggleFavorite(id, datasetId, datasetTitle, primaryTitle, secondaryText, rowJson)
        }
    }

    // ================= Calculators =================
    fun updateEmiParams(loanAmount: Double, rate: Double, tenureMonths: Int) {
        _emiLoanAmount.value = loanAmount
        _emiInterestRate.value = rate
        _emiTenureMonths.value = tenureMonths
        _emiResult.value = EmiCalculatorHelper.calculateEmi(loanAmount, rate, tenureMonths)
    }

    fun updatePayoutParams(loanAmount: Double, basePct: Double, bonusPct: Double) {
        _payoutLoanAmount.value = loanAmount
        _payoutBasePct.value = basePct
        _payoutBonusPct.value = bonusPct
        _payoutResult.value = PayoutCalculatorHelper.calculatePayout(loanAmount, basePct, bonusPct)
    }

    // ================= Document Checklist =================
    fun toggleDocumentCheck(docKey: String) {
        val current = _checkedDocs.value.toMutableMap()
        val isChecked = current[docKey] ?: false
        current[docKey] = !isChecked
        _checkedDocs.value = current
    }

    fun clearDocumentChecks() {
        _checkedDocs.value = emptyMap()
    }

    // ================= Data Import & Reset =================
    fun previewImportJson(jsonString: String, targetDatasetId: String) {
        val result = DataParser.parseJson(jsonString, targetDatasetId)
        _importPreview.value = result
    }

    fun previewImportCsv(csvString: String, targetDatasetId: String, title: String) {
        val result = DataParser.parseCsv(csvString, targetDatasetId, title)
        _importPreview.value = result
    }

    fun confirmImport(onComplete: (Boolean) -> Unit) {
        val preview = _importPreview.value
        if (preview != null && preview.isSuccess && preview.schema != null) {
            viewModelScope.launch {
                val success = repository.importDataset(preview.schema)
                _importStatusMessage.value = if (success) "Successfully imported ${preview.schema.title} (${preview.previewRowCount} rows)" else "Failed to save dataset."
                _importPreview.value = null
                onComplete(success)
            }
        } else {
            onComplete(false)
        }
    }

    fun resetToDefaultData(onComplete: () -> Unit) {
        viewModelScope.launch {
            repository.initializeDatabaseIfNeeded(forceReset = true)
            dataStoreManager.updateDataVersion(1, "2026-10-07")
            _importStatusMessage.value = "Reset to default factory dataset completed."
            onComplete()
        }
    }

    // ================= Settings =================
    fun setThemeMode(mode: String) {
        viewModelScope.launch {
            dataStoreManager.setThemeMode(mode)
        }
    }

    fun setAppLock(enabled: Boolean, pin: String? = null, biometric: Boolean = true) {
        viewModelScope.launch {
            dataStoreManager.setAppLock(enabled, pin, biometric)
        }
    }

    fun setFlagSecure(enabled: Boolean) {
        viewModelScope.launch {
            dataStoreManager.setFlagSecure(enabled)
        }
    }

    // Factory helper for cases where ViewModelProvider is used without Hilt
    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            val repository = ServiceLocator.provideRepository(context)
            val dataStoreManager = ServiceLocator.provideDataStoreManager(context)
            return FinanceViewModel(repository, dataStoreManager) as T
        }
    }
}
