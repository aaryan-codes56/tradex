# TradeX – An AI-Powered Autonomous Crypto Trading Platform

**TradeX** is an intelligent, autonomous crypto trading platform that integrates advanced artificial intelligence techniques, effective risk management, real-time data analysis, and explainable decision-making.

## 1. Problem Statement
Cryptocurrency trading has experienced rapid growth, attracting individual traders, developers, and institutions worldwide. However, crypto markets are highly volatile, operate continuously without closure, and are influenced by diverse factors such as price movements, technical indicators, global news, social media sentiment, and sudden liquidity changes.

Most retail traders rely on manual trading or basic automated trading bots that are rule-based and dependent on simple indicators such as RSI or moving averages. These systems lack adaptability, do not learn from market behavior, and fail to implement robust risk management, often resulting in significant financial losses. Furthermore, many automated trading systems function as black-box solutions, offering no explanation for why a trade was executed. This lack of transparency reduces user trust and makes it difficult to evaluate or improve trading strategies.

**TradeX addresses these challenges** by developing a full-stack, AI-powered crypto trading platform that can autonomously analyze market conditions, make informed trading decisions, manage risk, execute trades, and clearly explain the rationale behind each decision in an educational and secure manner.

## 2. Objectives
The main objectives of this project are:
*   To design and develop an **AI-driven autonomous crypto trading system** that does not rely on fixed rule-based strategies.
*   To implement machine learning models such as **LSTM/GRU** for price prediction and reinforcement learning for buy/sell/hold decision-making.
*   To integrate a comprehensive **risk management system** including dynamic stop-loss, position sizing, capital allocation, and daily loss limits.
*   To analyze **market sentiment** using natural language processing techniques applied to crypto news and social media data.
*   To provide **paper trading and historical backtesting** features for safe strategy testing and evaluation.
*   To implement **explainable AI mechanisms** that justify each trading decision in a human-readable format.
*   To develop an interactive and intuitive **web dashboard** for monitoring live trades, AI confidence, risk exposure, and performance metrics.
*   To ensure secure user authentication, authorization, and data handling using industry-standard practices.

## 3. System Architecture

### High-Level Architecture
`User` → `Frontend (React.js Dashboard)` → `Backend API (Node.js + Express)` → `AI Engine & Trading Logic` → `Database (MongoDB)` → `Crypto Exchange APIs`

### Architecture Description
*   **Frontend**: Handles user interaction, visual dashboards, charts, and real-time updates.
*   **Backend**: Manages authentication, market data processing, AI signal handling, risk checks, and trade execution.
*   **AI Engine**: Performs price prediction, sentiment analysis, reinforcement learning decisions, and ensemble strategy evaluation.
*   **Database**: Stores user data, trades, AI predictions, strategies, and performance logs.
*   **External APIs**: Fetch market data and execute trades in paper or live mode.

## 4. Key Features

### Authentication & Authorization
*   User registration, login, and logout
*   JWT-based secure authentication
*   User-specific data isolation

### AI Trading Brain
*   **LSTM / GRU models** for price forecasting
*   **Reinforcement learning agent** for adaptive trading
*   **Ensemble strategy** combining multiple AI models
*   **Trade outputs**: Trade signal (Buy/Sell/Hold), Confidence score, Risk level

### Risk Management System
*   Dynamic stop-loss calculation
*   Maximum daily loss limits
*   Capital allocation per trade
*   Volatility-based position sizing

### Market Sentiment Analysis
*   NLP-based sentiment analysis on crypto news articles, Twitter, and Reddit headlines
*   **Outputs**: Bullish/Bearish sentiment score, Fear index, Trade bias indicator

### Strategy Simulator (Backtesting Engine)
*   Selection of strategy and date range
*   **Performance metrics**: Net profit/loss, Maximum drawdown, Win rate, Sharpe ratio

### Paper Trading & Live Trading
*   **Paper trading mode** for safe experimentation
*   **Live trading mode** using real exchange APIs
*   Identical AI and risk logic for both modes

### Explainable AI (XAI)
*   Clear explanation for every executed trade
*   **Factors considered**: Technical indicators, Market sentiment, Volume and volatility, Risk constraints

### Dashboard & Visualization
*   Live price charts
*   Open positions overview
*   Trade history and logs
*   AI confidence meter
*   Risk exposure visualization

## 5. Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React.js, React Router, Axios, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT |
| **AI / ML** | Python, LSTM, GRU, Reinforcement Learning |
| **NLP** | Transformer-based sentiment models / APIs |
| **Hosting** | Vercel, Render, MongoDB Atlas |

## 6. API Overview

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/login` | POST | Authenticate user | Public |
| `/api/user/profile` | GET | Fetch user profile | Authenticated |
| `/api/market/prices` | GET | Get live market prices | Authenticated |
| `/api/ai/predictions` | GET | Get AI trade signals | Authenticated |
| `/api/trades/paper` | POST | Execute paper trade | Authenticated |
| `/api/trades/live` | POST | Execute live trade | Authenticated |
| `/api/trades/history` | GET | Retrieve trade history | Authenticated |
| `/api/strategies/backtest` | POST | Run backtesting simulation | Authenticated |

## 7. Scope of the Project

### In Scope
*   Full-stack MERN application development
*   AI-based trade decision system
*   Risk-managed autonomous trading logic
*   Paper trading and backtesting
*   Explainable AI insights
*   Secure authentication and dashboards

### Out of Scope
*   Financial advisory or profit guarantees
*   Support for all crypto exchanges
*   High-frequency institutional trading
*   Commercial regulatory compliance

## 8. Project Nature & Disclaimer
This project is developed strictly for educational and research purposes. It does not provide financial advice, guarantee profits, or encourage real-world financial risk-taking.
