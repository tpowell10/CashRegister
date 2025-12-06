# Build Instructions

## Prerequisites

- Node.js 18+ 
- npm

## Installation

```bash
npm install
```

## Running the Application

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Running Tests

Run all tests:

```bash
npm test
```

Expected output: **90 tests passing** across 4 test suites.

### Test Suites

| File | Description |
|------|-------------|
| `calculator.test.ts` | Core calculation logic, edge cases, batch processing |
| `parser.test.ts` | Input parsing, validation, error handling |
| `strategies.test.ts` | Greedy algorithm, random mode, divisibility |
| `currencies.test.ts` | USD/EUR denomination configurations |

### Watch Mode (for development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Linting

```bash
npm run lint
```

## Usage

### Web Interface

1. **Quick Calculate**: Enter amount owed and amount paid, click "Calculate Change"
2. **File Upload**: Upload a `.txt` file with transactions (one per line, format: `owed,paid`)

### Sample Input File

Create a text file with contents like:

```
2.12,3.00
1.97,2.00
3.33,5.00
```

Upload it via the "File Upload" tab to process multiple transactions at once.

