# DebtSlayer

> Reducing technical debt across the analytics platform by identifying, prioritizing, and safely deprecating low-value dbt models.

---

🏆 **Winner – Organization-wide Engineering Hackathon**

---

| **Role** | Data Engineer |
|----------|---------------|
| **Project Type** | Internal Engineering Platform |
| **Recognition** | 🏆 Organization-wide Hackathon Winner |
| **Status** | Production |
| **Tech Stack** | dbt · Snowflake · Airflow · SelectStar · Python |

---

## 📄 Executive Summary

Over time, the analytics platform accumulated hundreds of dbt models that continued to consume resources despite providing little or no business value. These models increased Snowflake compute costs, expanded Airflow DAG complexity, slowed CI/CD pipelines, complicated data lineage, and made the analytics platform increasingly difficult to maintain.

DebtSlayer was developed during an organization-wide engineering hackathon to address this growing technical debt. Rather than focusing solely on query optimization, the project introduced a structured framework for classifying data models based on business criticality and usage patterns. By combining Snowflake query history with SelectStar lineage information, the solution identified candidates for deprecation, prioritized optimization efforts for high-value models, and reduced unnecessary workload across the entire analytics platform.

The solution was successfully deployed to production and contributed to improved platform stability, streamlined engineering workflows, and reduced infrastructure overhead across dbt, Airflow, Snowflake, CI/CD pipelines, and downstream analytics tooling.

---

## 📉 The Platform Before DebtSlayer

Over time, the analytics platform accumulated hundreds of dbt models, many of which continued to exist despite providing little or no business value. As teams evolved and ownership changed, these models were rarely revisited, resulting in growing technical debt across the platform.

Although individual models appeared inexpensive in isolation, their combined impact affected multiple parts of the data ecosystem.

### Challenges

- 📦 Hundreds of dbt models increased project complexity and made the codebase difficult to maintain.
- 🔄 Airflow DAGs became increasingly complex, leading to longer execution times, scheduler instability, and timeout-related failures.
- ❄️ Snowflake warehouses continued processing low-value transformations, increasing compute consumption.
- 🌐 SelectStar lineage graphs became cluttered with obsolete models, making data discovery and impact analysis more difficult.
- 🚀 CI/CD pipelines validated and tested unnecessary models, increasing deployment time and engineering overhead.
- 👥 As ownership changed over time, unused models remained in production because no structured cleanup process existed.

The platform needed a systematic approach to distinguish critical assets from technical debt without impacting business-critical data pipelines.

---

## 🎯 DebtSlayer Strategy

Rather than attempting to optimize every dbt model individually, DebtSlayer introduced a structured framework to identify technical debt, prioritize engineering effort, and safely remove low-value assets from the analytics platform.

The strategy was built around three core principles:

### 1. Inventory & Discovery

The first step was to create a complete inventory of the existing dbt models. Usage information from Snowflake Query History was combined with lineage metadata from SelectStar to understand how each model was consumed across the platform.

This helped answer questions such as:

- Which models were actively queried?
- Which downstream systems depended on them?
- Which models had become obsolete over time?

### 2. Priority Classification

Each model was assigned a priority based on business criticality and platform usage.

| Priority | Description |
|----------|-------------|
| **P0** | Business-critical models with high usage and production impact. A small subset also represented foundational models without upstream dependencies. |
| **P1** | Frequently used models supporting important analytics and downstream reporting. |
| **P2** | Moderately used models with limited business impact. |
| **P3** | Rarely or never used models that primarily contributed to technical debt and unnecessary infrastructure consumption. |

This classification allowed engineering effort to be directed where it delivered the greatest value.

### 3. Action Plan

Each priority group followed a different strategy.

- **P3 models** were identified as deprecation candidates and moved into a dedicated `deprecated_data_models` directory after validation.
- **P2 models** were reviewed individually to determine whether they should be optimized, retained, or deprecated.
- **P0 and P1 models** remained in production and became the primary focus for query optimization and performance improvements.

This phased approach minimized operational risk while steadily reducing technical debt across the analytics platform.

> [!NOTE]
> The objective was not to delete models indiscriminately. It was to establish a repeatable decision-making framework that balanced platform health with business continuity.

---

## 🏗️ Solution Architecture

DebtSlayer follows a decision-driven architecture that combines usage analytics, lineage metadata, and business criticality to identify technical debt across the analytics platform.

Rather than focusing solely on query optimization, the solution evaluates the lifecycle of dbt models, classifies them based on their business value, and determines whether they should be optimized, retained, or deprecated.

<p align="center">
  <img src="images/architecture_2.svg" alt="DebtSlayer Solution Architecture" width="900">
</p>

### High-Level Flow

1. Collect metadata from dbt, Snowflake Query History, and SelectStar lineage.
2. Analyze model usage, dependencies, and business impact.
3. Classify models into priority tiers (P0–P3).
4. Determine the appropriate action for each model:
   - Optimize high-value models.
   - Deprecate low-value models.
5. Validate platform stability by monitoring Airflow, Snowflake, CI/CD, and downstream dependencies.
6. Measure platform improvements and continue monitoring after deployment.

---

## ⚙️ Implementation Workflow

The implementation followed a phased approach to ensure that technical debt could be reduced without disrupting production workloads.

### Phase 1 — Inventory & Analysis

- Collected dbt model inventory across the analytics platform.
- Combined Snowflake Query History with SelectStar lineage to understand model usage, dependencies, and downstream impact.
- Identified models that had become obsolete due to changing business requirements or ownership.

### Phase 2 — Priority Classification

Each model was classified into one of four priority groups:

- **P0** – Business-critical models supporting production analytics. A small subset also represented foundational models without upstream dependencies.
- **P1** – Frequently used models with significant downstream impact.
- **P2** – Moderately used models requiring individual evaluation.
- **P3** – Rarely or never used models identified as technical debt candidates.

### Phase 3 — Optimization & Deprecation

- Moved validated P3 models into a dedicated `deprecated_data_models` directory.
- Reviewed P2 models individually to determine whether they should be retained, optimized, or deprecated.
- Focused optimization efforts on P0 and P1 models responsible for the majority of compute consumption.

### Phase 4 — Validation

Following each phase, the platform was continuously monitored to ensure that:

- Airflow DAG execution remained stable.
- Snowflake workloads behaved as expected.
- CI/CD validation completed successfully.
- Downstream analytics and reporting remained unaffected.

This incremental rollout minimized operational risk while enabling measurable improvements across the analytics platform.

---

## 🚀 Platform Impact

DebtSlayer delivered value beyond dbt model cleanup by improving the overall health of the analytics platform. Removing unnecessary models reduced operational overhead across multiple components of the data ecosystem while allowing engineering teams to focus on business-critical workloads.

### 📦 dbt

- Reduced technical debt by identifying and deprecating low-value data models.
- Improved project maintainability by separating deprecated models from active development.
- Simplified the overall analytics codebase.

### 🔄 Airflow

- Reduced unnecessary DAG dependencies and execution overhead.
- Improved scheduler stability by eliminating low-value transformations.
- Helped reduce DAG failures and timeout-related issues caused by excessive workload.

### ❄️ Snowflake

- Reduced warehouse compute consumption by removing unnecessary transformations.
- Focused optimization efforts on high-impact (P0/P1) models responsible for the majority of compute utilization.
- Enabled more efficient warehouse utilization across production workloads.

### 🌐 SelectStar

- Simplified lineage graphs by removing obsolete models.
- Improved visibility into actively maintained datasets and their dependencies.

### 🚀 CI/CD

- Reduced validation and testing overhead during deployments.
- Shortened engineering feedback cycles by minimizing unnecessary model execution.
- Improved deployment confidence through a leaner analytics platform.

> [!IMPORTANT]
> DebtSlayer was not simply a cleanup initiative. It introduced a repeatable framework for identifying, prioritizing, and managing technical debt across the analytics platform.

---

## 🛠️ Technologies Used

| Category | Technology |
|----------|------------|
| Data Transformation | dbt |
| Data Warehouse | Snowflake |
| Workflow Orchestration | Apache Airflow |
| Data Lineage | SelectStar |
| Programming Language | Python |
| Version Control | Git |
| CI/CD | GitHub Actions / Internal CI Pipeline |

---

## 📊 Project at a Glance

| Metric | Value |
|---------|------:|
| 🏆 Recognition | Organization-wide Hackathon Winner |
| 📦 dbt Models Reviewed | 650+ |
| ⚡ dbt P95 Runtime Improvement | 67% |
| 🚀 Production Rollout | Yes |
| 🎯 Primary Goal | Technical Debt Reduction |

---

## 📊 Project at a Glance

| Metric | Value |
|---------|------:|
| 🏆 Recognition | Organization-wide Hackathon Winner |
| 📦 dbt Models Reviewed | 650+ |
| ⚡ dbt P95 Runtime Improvement | 67% |
| 🚀 Production Rollout | Yes |
| 🎯 Primary Goal | Technical Debt Reduction |

---

## 🔮 Future Improvements

Potential enhancements include:

- Automate priority classification using historical usage trends.
- Continuously monitor model activity to identify new technical debt.
- Introduce automated recommendations for model deprecation candidates.
- Integrate platform health metrics into engineering dashboards.
- Expand the framework to include warehouse optimization and storage utilization.