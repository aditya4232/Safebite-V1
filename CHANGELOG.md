# SafeBite Changelog

All notable changes to the SafeBite project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2023-07-15

### Added
- Complete UI redesign with shadcn/ui components
- Three.js visualizations for health data
- Gemini AI integration for food analysis
- Health data charts and graphs in dashboard
- Comprehensive health check feature with PDF reports
- SafeBite scraping for grocery products from multiple sources
- Weekly changing questions as popups
- Achievement badges with XP points
- Health/food news section refreshed every 30 minutes
- Unified notification system
- Admin panel for managing notifications and user data

### Changed
- Improved authentication flow with secure session management
- Enhanced food delivery search with real restaurant data
- Updated "Coming Soon" to "Now Live" for food delivery
- Improved grocery product functionality with web scraping
- Enhanced questionnaire with charts and animations
- Moved profile management from settings to sidebar
- Improved food search with Gemini AI integration

### Fixed
- Fixed authentication persistence across page refreshes
- Fixed guest mode session management
- Fixed food delivery popup display issues
- Fixed grocery product detail view
- Fixed import errors in various components

### Security
- Moved all API keys to environment variables
- Enhanced .gitignore to prevent sensitive data leakage
- Implemented secure session management
- Added proper authentication guards for protected routes

## [1.5.0] - 2023-05-20

### Added
- Food delivery integration with Swiggy and Zomato
- Grocery product search functionality
- Basic health check features
- Initial dashboard implementation
- Guest user authentication

### Changed
- Improved UI with sci-fi theme
- Enhanced mobile responsiveness
- Updated navigation sidebar

### Fixed
- Various UI bugs and inconsistencies
- Authentication issues
- Performance optimizations

## [1.0.0] - 2023-03-10

### Added
- Initial release of SafeBite
- Basic food search functionality
- User authentication with Firebase
- Nutrition information display
- Recipe suggestions
- Simple dashboard
