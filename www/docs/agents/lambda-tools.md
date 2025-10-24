---
id: lambda-tools
title: Lambda Tools
sidebar_label: Lambda Tools
---

import CodePanel from '@site/src/theme/CodePanel';

Lambda Tools enable you to create custom Python functions that your agents can 
execute during conversations. These user-defined functions run in secure, 
sandboxed environments, allowing you to extend agent 
capabilities with custom business logic, data processing, or integrations.

Lambda Tools are user-defined functions that:

- Execute in a **sandboxed Python 3.11 environment** with gVisor isolation.
- Have **automatic schema discovery** from function type annotations.
- Support a **curated set of libraries**: `json`, `math`, `datetime`, `collections`, 
  `itertools`, `functools`, `re`, `time`, `numpy` (1.24.3), `pandas` (2.0.3).
- Include **resource limits**: 100MB memory (up to 1GB), 30-second timeout 
  (up to 300 seconds).
- Provide **complete audit trails** of execution history.

:::tip Note
Lambda Tools run **without** network access. You have read-only file system access, and 
you **cannot** install custom packages. This ensures secure execution in multi-tenant 
environments.
:::

## Create a Lambda Tool

To create a Lambda Tool, review the prerequisites, define a function, and 
use the API.

1. Meet the following prerequisites:
   - Access to the Vectara API with tool creation permissions.
   - Basic Python familiarity.
   - API key.
2. Define a simple function. The entry point must be `process` (recommended), `main`, or `execute`.  
   This example calculates customer scores based on their activity metrics.  
    <CodePanel
      title="customer_score_calculator.py"
      layout="stacked"
      snippets={[
        {
          language: "python",
          code: `def process(order_count: int, total_revenue: float, days_active: int = 1) -> dict:
        """Calculate customer score based on activity metrics."""
        score = (order_count * 10 + total_revenue * 0.1) / days_active
        tier = 'gold' if score > 20 else 'silver' if score > 10 else 'bronze'
        return {
            'score': round(score, 2),
            'tier': tier
        }`
        }
      ]}
    />

   :::note Notes- The function must be named `process`, `main`, or `execute`
      - Use type hints for automatic schema discovery.
      - Parameters with default values become optional in the schema.
      - Return a **JSON-serializable dictionary**.
   :::
   Response:
   <CodePanel
     title="Schema Discovery Response"
     layout="stacked"
     snippets={[
       {
         language: "json",
         code: `{
      "id": "tcf_123",
      "type": "lambda",
      "name": "customer_score_calculator",
      "description": "Calculates a customer score based on order history and revenue",
      "enabled": true,
      "function_definition": {
        "language": "python",
        "language_version": "3.11",
        "code": "def process(order_count: int, total_revenue: float, days_active: int = 1) -> dict:...",
        "validation_status": "valid",
        "input_schema": {
          "type": "object",
          "properties": {
            "order_count": {"type": "integer"},
            "total_revenue": {"type": "number"},
            "days_active": {"type": "integer"}
          },
          "required": ["order_count", "total_revenue"],
          "additionalProperties": false
        },
        "output_schema": {
          "type": "object",
          "additionalProperties": true
        }
      }
    }`
       }
     ]}
   /> 
3. Create the Lambda Tool with the API.  
    <CodePanel
      title="Create Lambda Tool Request"
      layout="stacked"
      snippets={[
        {
          language: "curl",
          code: `curl -X POST https://api.vectara.io/v2/tools \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "type": "lambda",
        "language": "python",
        "name": "customer_score_calculator",
        "title": "Customer Score Calculator",
        "description": "Calculates a customer score based on order count, revenue, and days active. Returns score (0-100) and tier (bronze/silver/gold).",
        "code": "def process(order_count: int, total_revenue: float, days_active: int = 1) -> dict:\\n    score = (order_count * 10 + total_revenue * 0.1) / days_active\\n    tier = 'gold' if score > 20 else 'silver' if score > 10 else 'bronze'\\n    return {'score': round(score, 2), 'tier': tier}",
        "execution_configuration": {
          "max_execution_time_seconds": 30,
          "max_memory_mb": 100
        }
      }'`
        }
      ]}
    />
    Here is an example response: 
    <CodePanel
      title="Create Lambda Tool Response"
      layout="stacked"
      snippets={[
        {
          language: "json",
          code: `{
      "type": "lambda",
      "id": "tol_abc123",
      "name": "customer_score_calculator",
      "title": "Customer Score Calculator",
      "description": "Calculates a customer score based on order count, revenue, and days active.",
      "language": "python",
      "enabled": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "input_schema": {
        "type": "object",
        "properties": {
          "order_count": {"type": "integer"},
          "total_revenue": {"type": "number"},
          "days_active": {"type": "integer", "default": 1}
        },
        "required": ["order_count", "total_revenue"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "score": {"type": "number"},
          "tier": {"type": "string"}
        }
      },
      "function_definition": {
        "language": "python",
        "language_version": "3.11",
        "code": "def process(order_count: int, total_revenue: float, days_active: int = 1) -> dict:...",
        "validation_status": "valid"
      }
    }`
        }
      ]}
    />

The input and output schemas were automatically discovered from the function's 
type annotations.

## Test Lambda Tools

Before deploying your Lambda Tool to agents, test it with sample inputs to 
verify correct behavior.

### Test your Lambda Tool

<CodePanel
  title="Test Lambda Tool Request"
  layout="stacked"
  snippets={[
    {
      language: "curl",
      code: `curl -X POST https://api.vectara.io/v2/tools/tol_abc123/test \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "order_count": 50,
      "total_revenue": 5000,
      "days_active": 30
    },
    "timeout_seconds": 30
  }'`
    }
  ]}
/>

**Test Response:**

<CodePanel
  title="Test Lambda Tool Response"
  layout="stacked"
  snippets={[
    {
      language: "json",
      code: `{
  "success": true,
  "output": {
    "score": 33.33,
    "tier": "gold"
  },
  "execution_time_ms": 125,
  "memory_used_mb": 12,
  "validation_results": {
    "input_valid": true,
    "output_valid": true,
    "validation_errors": []
  }
}`
    }
  ]}
/>

### Handle test failures

If your function has errors, the test response includes debugging information:

<CodePanel
  title="Test Failure Response"
  layout="stacked"
  snippets={[
    {
      language: "json",
      code: `{
  "success": false,
  "error": {
    "message": "ZeroDivisionError: division by zero",
    "traceback": "Traceback (most recent call last):\\n  File \\"<string>\\", line 3, in process\\nZeroDivisionError: division by zero"
  },
  "execution_time_ms": 45,
  "memory_used_mb": 10
}`
    }
  ]}
/>

## Advanced schema discovery (optional)

For complex output structures, use `TypedDict` to define detailed schemas:

<CodePanel
  title="Advanced Schema Example"
  snippets={[{
    language: 'python',
    code: `from typing import TypedDict, List

class CustomerAnalysis(TypedDict):
    score: float
    tier: str
    recommendations: List[str]
    risk_level: str

def process(order_count: int, total_revenue: float, days_active: int = 1) -> CustomerAnalysis:
    score = (order_count * 10 + total_revenue * 0.1) / days_active
   
    recommendations = []
    if score < 10:
        recommendations.append("Engage with promotional offers")
    if order_count < 5:
        recommendations.append("Send product recommendations")
   
    return {
        'score': round(score, 2),
        'tier': 'gold' if score > 20 else 'silver' if score > 10 else 'bronze',
        'recommendations': recommendations,
        'risk_level': 'low' if score > 15 else 'medium' if score > 5 else 'high'
    }`
  }]}
  annotations={{
    python: [
      { line: 1, text: 'Import TypedDict for structured output schema definition' },
      { line: 3, text: 'Define output structure with specific field types' },
      { line: 9, text: 'Use TypedDict as return type annotation for automatic schema discovery' },
      { line: 18, text: 'Return dictionary matching the TypedDict structure' }
    ]
  }}
  layout="stacked"
/>

This generates a detailed output schema:

<CodePanel
  title="Generated Output Schema"
  layout="stacked"
  snippets={[
    {
      language: "json",
      code: `{
  "type": "object",
  "properties": {
    "score": {"type": "number"},
    "tier": {"type": "string"},
    "recommendations": {
      "type": "array",
      "items": {"type": "string"}
    },
    "risk_level": {"type": "string"}
  },
  "required": ["score", "tier", "recommendations", "risk_level"]
}`
    }
  ]}
/>

## Work with data processing libraries

Lambda Tools support `numpy` and `pandas` for data analysis tasks:

<CodePanel
  title="Data Analysis Lambda Tool"
  layout="stacked"
  snippets={[
    {
      language: "python",
      code: `import pandas as pd
import numpy as np

def process(sales_data: list) -> dict:
    """Analyze sales data and return statistics."""
    df = pd.DataFrame(sales_data)

    return {
        'total_sales': float(df['amount'].sum()),
        'average_sale': float(df['amount'].mean()),
        'median_sale': float(df['amount'].median()),
        'std_deviation': float(df['amount'].std()),
        'top_products': df.nlargest(3, 'amount')['product'].tolist()
    }`
    }
  ]}
/>

> **Library Versions:** numpy 1.24.3 and pandas 2.0.3 are available. Other libraries like `math`, `datetime`, `json`, `re`, and standard library modules are also supported.

## Configure execution parameters

Adjust resource limits based on your function's requirements:

<CodePanel
  title="Execution Configuration"
  snippets={[{
    language: 'json',
    code: `{
  "type": "lambda",
  "name": "heavy_computation",
  "title": "Heavy Computation Tool",
  "description": "Performs intensive data processing",
  "code": "def process(data: list) -> dict: ...",
  "execution_configuration": {
    "max_execution_time_seconds": 120,
    "max_memory_mb": 512
  }
}`
  }]}
  annotations={{
    json: [
      { line: 7, text: 'Set timeout up to 300 seconds (5 minutes)' },
      { line: 8, text: 'Allocate memory up to 1024 MB (1 GB)' }
    ]
  }}
  layout="stacked"
/>

**Resource Limits:**

| Parameter | Default | Maximum | Description |
|-----------|---------|---------|-------------|
| `max_execution_time_seconds` | 30 | 300 | Function execution timeout |
| `max_memory_mb` | 100 | 1024 | Memory allocation limit |

## Update lambda tools

Modify existing Lambda Tools to update code, configuration, or metadata:

<CodePanel
  title="Update Lambda Tool Request"
  layout="stacked"
  snippets={[
    {
      language: "curl",
      code: `curl -X PATCH https://api.vectara.io/v2/tools/tol_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "lambda",
    "title": "Advanced Customer Score Calculator",
    "description": "Enhanced scoring with predictive analytics",
    "code": "def process(order_count: int, total_revenue: float, days_active: int = 1, loyalty_points: int = 0) -> dict:\\n    base_score = (order_count * 10 + total_revenue * 0.1) / days_active\\n    adjusted_score = base_score + (loyalty_points * 0.05)\\n    return {\\'score\\': round(adjusted_score, 2), \\'tier\\': \\'platinum\\' if adjusted_score > 30 else \\'gold\\' if adjusted_score > 20 else \\'silver\\'}",
    "execution_configuration": {
      "max_execution_time_seconds": 60,
      "max_memory_mb": 200
    }
  }'`
    }
  ]}
/>

When you update the code, schemas are automatically re-discovered from the new function signature.

## List all lambda tools

<CodePanel
  title="List Lambda Tools"
  layout="stacked"
  snippets={[
    {
      language: "curl",
      code: `curl -X GET "https://api.vectara.io/v2/tools?type=lambda" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    }
  ]}
/>

## Disable a lambda tool

<CodePanel
  title="Disable Lambda Tool"
  layout="stacked"
  snippets={[
    {
      language: "curl",
      code: `curl -X PATCH https://api.vectara.io/v2/tools/tol_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "lambda",
    "enabled": false
  }'`
    }
  ]}
/>

## Delete a lambda tool

<CodePanel
  title="Delete Lambda Tool"
  layout="stacked"
  snippets={[
    {
      language: "curl",
      code: `curl -X DELETE https://api.vectara.io/v2/tools/tol_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    }
  ]}
/>

## Use a lambda tool with an agent

Use an inline configuration (point an agent to an existing tool by ID).

<CodePanel
title="Inline Lambda Tool Configuration (inside Agent)"
layout="stacked"
snippets={[
  {
    language: "json",
    code: `{ "type": "lambda", "tool_id": "tol_abc123", "argument_override": { "customer_tier": "enterprise", "query": { "$ref": "session.metadata.search_query" } // dynamic context reference } }`
  }  
]}
/>

You can also create a reusable LambdaToolConfiguration you can reference 
across multiple agents (with function_definition, argument_override, and 
metadata). Use this for consistent, governed usage.
