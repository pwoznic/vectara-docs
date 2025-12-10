---
id: guardrails
title: Guardrails
sidebar_label: Guardrails
---

import CodePanel from '@site/src/theme/CodePanel';

Guardrails are predefined validators that ensure agents behave correctly 
inside a session. Guardrails run automatically before a tool call or final 
response is accepted, catching common LLM mistakes such as invalid tool 
arguments, missing required tool calls, or unnecessary tool usage.


## Currently available guardrails
      
Vectara provides the following predefined guardrails:

### Tool validator

The Tool validator provides the following checks:
* **Incorrect arguments check** ensures tool calls include valid parameters that 
  match the tool's schema.
* **Missing tools check** detects when the agent should use a tool but fails to do 
  so.
* **Unnecessary tools check** identifies tool calls that are irrelevant or redundant 
  for the current task.

To view the available guardrails, see List Guardrails in the API Reference.

## Using guardrails with agents

You can enable guardrails when you create, update, or replace an agent. Each 
guardrail entry specifies a guardrail key, model name, and the maximum number 
of retries to correct a failing step.

Here are some example for the currently available guardrails:

### Example: Incorrect Arguments Check

Ensure the tool calls include valid parameters that match the schema.

<CodePanel
title="Enable Incorrect Arguments Check"
layout="stacked"
snippets={[
{
language: "json",
code: `{
   "enabled": [
    {
      "guardrail_key": "grd_incorrect_arguments",
      "model_name": "gpt-4o-mini"
    }
   ],
   "max_retries": 3
}`
}
]}
/>

### Example: Missing Tools Check

Detect when the agent should call a tool but fails to actually call the tool.

<CodePanel
title="Enable Missing Tools Check"
layout="stacked"
snippets={[
{
language: "json",
code: `{
   "enabled": [
    {
      "guardrail_key": "grd_missing_tools",
      "model_name": "gpt-4o-mini"
    }
   ],
   "max_retries": 2
}`
}
]}
/>

### Example: Unnecessary Tools Check

Identify tool calls that are irrelevant or redundant for the task.

<CodePanel
title="Enable Unnecessary Tools Check"
layout="stacked"
snippets={[
{
language: "json",
code: `{
   "enabled": [
    {
      "guardrail_key": "grd_unnecessary_tools",
      "model_name": "gpt-4o-mini"
    }
   ],
   "max_retries": 3
}`
}
]}
/>
