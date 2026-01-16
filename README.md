# Fullstack home assignment

## Introduction

Your goal is to implement a simple dApp that computes and displays statistics about on-chain activity.

There is no time limit for this exercise. Good luck!

## Installation requirements

Ensure Nodejs.20+ and npm.10+ installed

- [Backend instructions](backend/README.md)
- [Frontend instructions](frontend/README.md)

## Evaluation

You will be evaluated on the implementation of the features, your technical choices and the overall code quality.

## Git Repository

Please work on a git branch formatted as `${firstname}-${lastname}` and make at least one commit for each of the questions below.

## Question 1: Time-Series Bar Chart

Your goal is to display a time-series bar chart showing the USDT token transfer volumes, aggregated into 30-minute periods, for the timestamp range  `1763337600` (included) to `1763424000` (excluded). Note: the range covers the full day of November 17th in UTC.

Constraints:
- The blockchain data must be fetched from the backend service.
- You are not allowed to take advantage of the fact the time range is static. (i.e., you can't take a shortcut by pre-fetching all data into a file)
- All the computations should be done by some code you provide (you may choose to perform the aggregation in the backend or the frontend).

Tips:
- You may use this RPC key to load ethereum on-chain data: `https://mainnet.infura.io/v3/beac65db41a7469f99f1a47c2d493e2f`
- The address of the `USDT` token on eth mainnet is `0xdac17f958d2ee523a2206206994597c13d831ec7`

## Question 2: Top Senders Pie Chart
Your goal is to add a pie chart displaying the top senders (addresses that sent the largest total volume of the token) over the same period.
The pie chart must display the top senders that collectively account for the 90th percentile of the total volume, and aggregate the remaining addresses under the label "Others."

Constraints:
- All the previous constraints from Question 1 apply.

## Question 3: Multi-Chain Support

- Adapt your dApp to support displaying the data from both Ethereum and Binance Smart Chain. Users should be able to switch chain easily with a selector and see both graphs update. The time range is the same as for question 1.

Constraints:
- All the previous constraints from Question 1 & 2 apply.

Tips:
- You may use this RPC key to load BSC on-chain data: `https://bsc-mainnet.infura.io/v3/beac65db41a7469f99f1a47c2d493e2f`
- The address of the `USDT` token on BSC is `0x55d398326f99059ff775485246999027b3197955`


## Deliverable

Please archive the whole repo (make sure the `.git` folder is included) with **tar**: `tar -cvzf assignment.tar.gz fullstack-home-assignment` and send us the archive by email
