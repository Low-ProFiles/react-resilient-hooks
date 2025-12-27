# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-28

### Added

- **Retry Policy for useBackgroundSync**: Exponential backoff with configurable retry behavior
  - `maxRetries`: Maximum number of retry attempts (default: 3)
  - `retryDelay`: Custom delay function for backoff (default: exponential up to 30s)
  - `shouldRetry`: Function to determine if a request should be retried
  - `onRetry` callback for monitoring retry attempts
- **Test Suite**: Comprehensive test coverage with Vitest and React Testing Library
  - 50 tests covering all hooks and store implementations
  - Tests for network status, adaptive image selection, polling behavior, and background sync
- **TSDoc Comments**: Full documentation for all exported types and functions
- **Subpath Exports**: Tree-shaking support with individual hook imports
  - `react-resilient-hooks/hooks/useNetworkStatus`
  - `react-resilient-hooks/hooks/useAdaptiveImage`
  - `react-resilient-hooks/hooks/useAdaptivePolling`
  - `react-resilient-hooks/hooks/useBackgroundSync`
  - `react-resilient-hooks/stores`
- **QueueStore.clear()**: Method to clear all items from queue stores

### Changed

- Removed dead code from core/ directory (unused storage providers and logger)
- Improved type exports and documentation

### Fixed

- Queue store interface now properly includes all required methods

## [1.0.0] - 2024-12-01

### Added

- Initial release
- `useNetworkStatus`: Real-time network status monitoring
- `useAdaptiveImage`: Network-aware image quality selection
- `useAdaptivePolling`: Adaptive polling with network-aware intervals
- `useBackgroundSync`: Request queueing and background synchronization
- `MemoryQueueStore`: In-memory queue implementation
- `IndexedDBQueueStore`: Persistent IndexedDB queue implementation
- `EventBus`: Simple pub/sub event system
