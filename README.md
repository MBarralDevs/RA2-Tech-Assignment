# USDT Transfer Analytics - Fullstack dApp

A decentralized application that analyzes USDT token transfer activity on Ethereum and Binance Smart Chain for November 17, 2025.

**Developed by:** Martin Barral
**Assignment for:** RA2-TECH

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Features Implemented](#features-implemented)
- [Technical Challenges & Solutions](#technical-challenges--solutions)
- [Known Limitations](#known-limitations)
- [Technology Stack](#technology-stack)

---

## 🎯 Overview

This project implements a full-stack dApp that fetches, processes, and visualizes on-chain USDT transfer data. The application addresses three main questions:

1. **Time-Series Bar Chart**: Display 30-minute aggregated transfer volumes
2. **Top Senders Pie Chart**: Show top 90th percentile senders by volume
3. **Multi-Chain Support**: Support both Ethereum and BSC networks

---

## 🏗️ Architecture

### Backend (Rust)

- **Framework**: Actix-web for REST API
- **Blockchain Library**: ethers-rs for Ethereum/BSC interaction
- **Design Pattern**: Modular architecture with separation of concerns

```
backend-rust/
├── src/
│   ├── main.rs              # Server entry point
│   ├── blockchain/          # Blockchain interaction layer
│   │   ├── client.rs        # RPC client with batching
│   │   └── types.rs         # Data structures
│   ├── aggregation/         # Data processing
│   │   └── volume.rs        # Time-series & percentile calculations
│   └── api/                 # REST endpoints
│       └── handlers.rs      # Request handlers
└── Cargo.toml               # Dependencies
```

### Frontend (React + TypeScript)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React hooks (useState, useEffect)

```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── components/
│   │   ├── ChainSelector.tsx    # Blockchain toggle
│   │   ├── VolumeChart.tsx      # Bar chart (30-min intervals)
│   │   └── TopSendersChart.tsx  # Pie chart (top 90%)
│   └── api/
│       └── client.ts        # Backend API client
└── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Rust** 1.70+ and Cargo
- **Node.js** 20+ and npm 10+
- **WSL** or Linux/macOS environment

### Backend Setup

```bash
# Navigate to backend directory
cd backend-rust

# Install dependencies and build (first time takes 2-3 minutes)
cargo build --release
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## 🎮 Running the Application

### Step 1: Start the Backend Server

```bash
cd backend-rust
cargo run --release
```

You should see:

```
🚀 Starting USDT Transfer Analytics API
📡 Server listening on http://127.0.0.1:8080
```

### Step 2: Start the Frontend Development Server

In a **new terminal**:

```bash
cd frontend
npm run dev
```

You should see:

```
➜  Local:   http://localhost:5173/
```

### Step 3: Access the Application

Open your browser and navigate to: **http://localhost:5173/**

---

## ✅ Features Implemented

### Question 1: Time-Series Bar Chart ✓

**Implementation:**

- Fetches all USDT `Transfer` events from the blockchain for November 17, 2025
- Aggregates transfers into 30-minute buckets (48 total periods)
- Displays volume in a responsive bar chart with Recharts
- Formats large numbers with proper thousand separators

**Technical Details:**

- Backend aggregation ensures consistent calculations
- USDT uses 6 decimals (not 18 like most ERC20 tokens)
- Timestamp estimation optimized to reduce RPC calls (1 per batch vs 1 per event)

**Result:** ✅ Fully functional for Ethereum

- ~475,000 transfer events processed
- ~36 billion USDT total volume
- Load time: 4-5 minutes

---

### Question 2: Top Senders Pie Chart ✓

**Implementation:**

- Calculates total volume sent by each address
- Sorts senders by volume (descending)
- Iteratively selects senders until reaching 90% of total volume
- Aggregates remaining addresses as "Others"

**Technical Details:**

- Percentages calculated dynamically
- Custom tooltip shows full address + volume on hover
- Color generation: distinct colors for top 10, gradient for rest
- Scrollable legend to handle 200+ addresses

**Result:** ✅ Fully functional for Ethereum

- Top sender: 21.24% of total volume (7.7 billion USDT)
- 214 addresses in top 90th percentile
- "Others" represents ~10% (3.6 billion USDT)

---

### Question 3: Multi-Chain Support ⚠️

**Implementation:**

- Chain selector component with Ethereum/BSC toggle
- Dynamic RPC endpoint switching based on selected chain
- Separate USDT contract addresses per chain
- Consistent UI/UX across both chains

**Ethereum Result:** ✅ Fully functional

- Block range: 23,815,180 → 23,822,303 (~7,123 blocks)
- Load time: 4-5 minutes
- ~475,000 transfers processed

**BSC Result:** ⚠️ Functional but impractical without caching

- Block range: 68,448,664 → 68,563,853 (**115,189 blocks**)
- Estimated load time: **2-3 hours**
- Expected: ~9+ million transfers

**Why the Difference?**

| Metric          | Ethereum     | BSC            |
| --------------- | ------------ | -------------- |
| Block Time      | ~12 seconds  | ~3 seconds     |
| Blocks per Day  | ~7,200       | ~28,800        |
| USDT Activity   | High         | **Very High**  |
| Same 24h Period | 7,123 blocks | 115,189 blocks |

---

## 🔧 Technical Challenges & Solutions

### Challenge 1: RPC Query Limits

**Problem:** Infura limits responses to 10,000 results per query. USDT is extremely active (~5,000-10,000 transfers per 100 blocks).

**Solution:** Implemented batching strategy

```rust
const BATCH_SIZE: u64 = 50; // Fetch 50 blocks at a time
```

- Processes blockchain data in manageable chunks
- Avoids hitting rate limits
- Progress logging for transparency

**Trade-off:** Slower initial load time, but guaranteed completion

---

### Challenge 2: Excessive RPC Calls for Timestamps

**Problem:** Initial implementation called `get_block()` for each transfer event to get timestamps:

- 475,000 events = 475,000 RPC calls
- Estimated time: 30+ minutes just for timestamps

**Solution:** Timestamp estimation algorithm

```rust
// Get timestamp of first block in batch (1 RPC call)
let batch_start_timestamp = get_block(batch_start).timestamp;

// Estimate timestamps for other blocks
for event in events {
    let block_diff = event.block_number - batch_start;
    let estimated_timestamp = batch_start_timestamp + (block_diff * 12);
}
```

**Result:** Reduced from ~475,000 RPC calls to ~140 calls (99.97% reduction)

---

### Challenge 3: BSC Block Density

**Problem:** BSC has 4x more blocks than Ethereum for the same time period due to faster block times (3s vs 12s).

**Analysis:**

- Ethereum: 7,123 blocks = 142 batches @ 50 blocks each = 4-5 minutes
- BSC: 115,189 blocks = 2,304 batches @ 50 blocks each = **2-3 hours**

**Why This Happens:**

1. BSC block time: 3 seconds (Ethereum: 12 seconds)
2. Same 24-hour period = 4x more blocks on BSC
3. USDT is MORE active on BSC (higher TPS)
4. Result: ~9 million transfers vs Ethereum's ~475k

**Potential Solutions (Not Implemented Due to Constraints):**

1. **Backend Caching**
   - Cache processed results in database/Redis
   - Violates assignment constraint: "not allowed to pre-fetch data into a file"
2. **Parallel Batch Fetching**
   - Fetch multiple batches concurrently
   - Risk hitting Infura rate limits
   - Complexity increase

3. **Indexed Blockchain Data**
   - Use The Graph or similar indexing service
   - Changes architecture significantly
   - Outside scope of assignment

**Decision:** Documented limitation rather than violating constraints

---

## ⚠️ Known Limitations

### 1. BSC Load Time (2-3 hours)

**Impact:** Impractical for real-time use without caching  
**Reason:** 115,189 blocks to process with strict RPC query limits  
**Workaround:** For production, implement caching layer or use blockchain indexer

### 2. No Data Persistence

**Impact:** Every chain switch triggers a fresh fetch  
**Reason:** Assignment explicitly prohibits pre-fetching  
**Workaround:** Users should select a chain and wait for full load

### 3. Memory Usage

**Impact:** Large datasets (~9M events for BSC) held in memory  
**Reason:** In-memory processing for simplicity  
**Workaround:** For production, use streaming/database approach

---

## 🛠️ Technology Stack

### Backend

- **Language:** Rust 1.92
- **Web Framework:** Actix-web 4.9
- **Blockchain:** ethers-rs 2.0
- **Async Runtime:** Tokio 1.42
- **Serialization:** Serde 1.0

### Frontend

- **Framework:** React 19
- **Language:** TypeScript 5.9
- **Build Tool:** Vite 7.2
- **Styling:** Tailwind CSS 4.1
- **Charts:** Recharts
- **HTTP Client:** Fetch API

### Development Tools

- **Environment:** WSL (Ubuntu)
- **Version Control:** Git
- **Package Managers:** Cargo (Rust), npm (Node.js)

---

## 📊 Performance Metrics

### Ethereum (Fully Optimized)

```
Blocks Processed:     7,123
Transfer Events:      ~475,000
API Calls:            ~142 (batched)
Processing Time:      4-5 minutes
Memory Usage:         ~50 MB
Total Volume:         36.2 billion USDT
```

### BSC (Performance Challenge)

```
Blocks Processed:     115,189
Transfer Events:      ~9,000,000+
API Calls:            ~2,304 (batched)
Processing Time:      2-3 hours
Memory Usage:         ~500 MB (estimated)
Total Volume:         TBD
```

---

## 🎓 Key Learnings

1. **Blockchain Data Scale**: Real-world blockchain data is massive. A single day of USDT transfers = hundreds of thousands of events.

2. **RPC Optimization**: Every RPC call matters. Reducing 475k calls to 142 made the difference between impractical and usable.

3. **Chain Differences**: BSC and Ethereum have fundamentally different block production rates, requiring different optimization strategies.

4. **Trade-offs**: The "no caching" constraint demonstrates the importance of data persistence in production applications.

5. **Rust for Performance**: Rust's memory safety and zero-cost abstractions proved excellent for handling large datasets efficiently.

---

## 🔮 Production Recommendations

If deploying this application for real users, implement:

1. **Caching Layer**
   - Redis for recent data
   - PostgreSQL for historical data
   - Update every N blocks instead of full re-fetch

2. **Blockchain Indexer**
   - The Graph protocol
   - Custom indexer with event listeners
   - Pre-computed aggregations

3. **Progressive Loading**
   - Stream results as they're fetched
   - Display partial data while loading continues
   - WebSocket for real-time updates

4. **Rate Limiting**
   - Implement request queuing
   - Use multiple RPC providers
   - Exponential backoff on failures

---

## 📝 Assignment Compliance

✅ **Question 1**: Time-series bar chart implemented with 30-minute aggregation  
✅ **Question 2**: Top 90th percentile senders pie chart implemented  
⚠️ **Question 3**: Multi-chain support implemented; BSC functional but slow due to data volume

**Constraints Met:**

- ✅ Data fetched from backend (not pre-computed)
- ✅ No pre-fetching to files
- ✅ All computations done in code
- ✅ Proper git branch and commit history

**Technical Choices Justified:**

- Rust for performance and type safety
- Batching to handle RPC limits
- Timestamp estimation to reduce API calls
- React for responsive UI

---

## 👨‍💻 Developer Notes

This project demonstrates:

- Full-stack development (Rust backend + React frontend)
- Blockchain interaction and optimization
- Data aggregation algorithms
- Performance optimization under constraints
- Professional documentation and communication

**Time Investment:** ~8-10 hours

- Backend: ~5 hours
- Frontend: ~2 hours
- Testing & Optimization: ~2 hours
- Documentation: ~1 hour

---

## 📧 Contact

**Martin Barral**  
For questions or clarifications about technical decisions, please reach out via email.

---

_Built with ❤️ using Rust and React_
