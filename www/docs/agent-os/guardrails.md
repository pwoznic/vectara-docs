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

You can enable guardrails when you create, update, or replace an agent.

 ## Currently available guardrails
      
Vectara provides the following predefined guardrails:

* **Incorrect Arguments Check** ensures tool calls include valid parameters that 
  match the tool's schema.
* **Missing Tools Check** detects when the agent should use a tool but fails to do 
  so.
* **Unnecessary Tools Check** identifies tool calls that are irrelevant or redundant 
  for the current task.

To view the available guardrails, see the API Reference.

