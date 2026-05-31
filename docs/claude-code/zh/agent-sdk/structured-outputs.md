> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 在进一步探索前，请使用此文件了解所有可用页面。

# 从代理获取结构化输出

> 使用 JSON Schema、Zod 或 Pydantic 从代理工作流中返回经过验证的 JSON。在多轮工具使用后获得类型安全的结构化数据。

结构化输出让您可以定义希望从代理获得的确切数据结构。代理可以使用所需的任何工具完成任务，最终您仍将获得与您的模式匹配的、经过验证的 JSON。为所需结构定义一个 [JSON Schema](https://json-schema.org/understanding-json-schema/about)，SDK 将根据它验证输出，若不匹配则会重新提示。如果在重试次数限制内验证仍未成功，结果将是错误而非结构化数据；请参阅[错误处理](#error-handling)。

要实现完整的类型安全，请使用 [Zod](#type-safe-schemas-with-zod-and-pydantic) (TypeScript) 或 [Pydantic](#type-safe-schemas-with-zod-and-pydantic) (Python) 来定义您的模式，并获取强类型的对象返回。

## 为何需要结构化输出？

代理默认返回自由形式的文本，这对于聊天是有效的，但当您需要以编程方式使用输出时就不合适了。结构化输出为您提供类型化的数据，可以直接传递给您的应用程序逻辑、数据库或 UI 组件。

考虑一个食谱应用，代理搜索网络并带回食谱。没有结构化输出，您会得到需要自己解析的自由形式文本。有了结构化输出，您可以定义想要的结构，并直接获得可在应用中使用的类型化数据。


    ```text
    Here's a classic chocolate chip cookie recipe!

    **Chocolate Chip Cookies**
    Prep time: 15 minutes | Cook time: 10 minutes

    Ingredients:
    - 2 1/4 cups all-purpose flour
    - 1 cup butter, softened
    ...
    ```
    要在您的应用中使用此功能，您需要解析出标题，将"15 minutes"转换为数字，将食材与烹饪步骤分离，并处理不同回复中格式不一致的问题。



    ```json
    {
      "name": "Chocolate Chip Cookies",
      "prep_time_minutes": 15,
      "cook_time_minutes": 10,
      "ingredients": [
        { "item": "all-purpose flour", "amount": 2.25, "unit": "cups" },
        { "item": "butter, softened", "amount": 1, "unit": "cup" }
        // ...
      ],
      "steps": ["Preheat oven to 375°F", "Cream butter and sugar" /* ... */]
    }
    ```
    可直接用于你UI的类型化数据。


## 快速入门

要使用结构化输出，首先定义一个描述所需数据结构的 [JSON Schema](https://json-schema.org/understanding-json-schema/about)，然后通过 `query()` 函数的 `outputFormat`（TypeScript）或 `output_format`（Python）选项将其传递。当代理完成后，返回的结果消息中会包含一个 `structured_output` 字段，其中包含符合您定义的模式的验证数据。

以下示例要求代理调研 Anthropic 公司，并以结构化输出的形式返回公司名称、成立年份和总部所在地。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Define the shape of data you want back
  const schema = {
    type: "object",
    properties: {
      company_name: { type: "string" },
      founded_year: { type: "number" },
      headquarters: { type: "string" }
    },
    required: ["company_name"]
  };

  for await (const message of query({
    prompt: "Research Anthropic and provide key company information",
    options: {
      outputFormat: {
        type: "json_schema",
        schema: schema
      }
    }
  })) {
    // The result message contains structured_output with validated data
    if (message.type === "result" && message.subtype === "success" && message.structured_output) {
      console.log(message.structured_output);
      // { company_name: "Anthropic", founded_year: 2021, headquarters: "San Francisco, CA" }
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

  # Define the shape of data you want back
  schema = {
      "type": "object",
      "properties": {
          "company_name": {"type": "string"},
          "founded_year": {"type": "number"},
          "headquarters": {"type": "string"},
      },
      "required": ["company_name"],
  }


  async def main():
      async for message in query(
          prompt="Research Anthropic and provide key company information",
          options=ClaudeAgentOptions(
              output_format={"type": "json_schema", "schema": schema}
          ),
      ):
          # The result message contains structured_output with validated data
          if isinstance(message, ResultMessage) and message.structured_output:
              print(message.structured_output)
              # {'company_name': 'Anthropic', 'founded_year': 2021, 'headquarters': 'San Francisco, CA'}


  asyncio.run(main())
  ```

## 使用 Zod 和 Pydantic 实现类型安全模式

您可以使用 [Zod](https://zod.dev/)（TypeScript）或 [Pydantic](https://docs.pydantic.dev/latest/)（Python）来定义模式，而不是手动编写 JSON Schema。这些库会为您生成 JSON Schema，并允许您将响应解析为一个完全类型化的对象，以便在整个代码库中使用它，并享受自动补全和类型检查。

以下示例为一个功能实现计划定义了一个模式，该计划包含摘要、步骤列表（每个步骤都有复杂度级别）以及潜在风险。代理会规划该功能并返回一个类型化的 `FeaturePlan` 对象。然后，您可以访问诸如 `plan.summary` 之类的属性，并完全类型安全地遍历 `plan.steps`。

  ```typescript TypeScript
  import { z } from "zod";
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Define schema with Zod
  const FeaturePlan = z.object({
    feature_name: z.string(),
    summary: z.string(),
    steps: z.array(
      z.object({
        step_number: z.number(),
        description: z.string(),
        estimated_complexity: z.enum(["low", "medium", "high"])
      })
    ),
    risks: z.array(z.string())
  });

  type FeaturePlan = z.infer<typeof FeaturePlan>;

  // Convert to JSON Schema
  const schema = z.toJSONSchema(FeaturePlan);

  // Use in query
  for await (const message of query({
    prompt:
      "Plan how to add dark mode support to a React app. Break it into implementation steps.",
    options: {
      outputFormat: {
        type: "json_schema",
        schema: schema
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success" && message.structured_output) {
      // Validate and get fully typed result
      const parsed = FeaturePlan.safeParse(message.structured_output);
      if (parsed.success) {
        const plan: FeaturePlan = parsed.data;
        console.log(`Feature: ${plan.feature_name}`);
        console.log(`Summary: ${plan.summary}`);
        plan.steps.forEach((step) => {
          console.log(`${step.step_number}. [${step.estimated_complexity}] ${step.description}`);
        });
      }
    }
  }
  ```

  ```python Python
  import asyncio
  from pydantic import BaseModel
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage


  class Step(BaseModel):
      step_number: int
      description: str
      estimated_complexity: str  # 'low', 'medium', 'high'


  class FeaturePlan(BaseModel):
      feature_name: str
      summary: str
      steps: list[Step]
      risks: list[str]


  async def main():
      async for message in query(
          prompt="Plan how to add dark mode support to a React app. Break it into implementation steps.",
          options=ClaudeAgentOptions(
              output_format={
                  "type": "json_schema",
                  "schema": FeaturePlan.model_json_schema(),
              }
          ),
      ):
          if isinstance(message, ResultMessage) and message.structured_output:
              # Validate and get fully typed result
              plan = FeaturePlan.model_validate(message.structured_output)
              print(f"Feature: {plan.feature_name}")
              print(f"Summary: {plan.summary}")
              for step in plan.steps:
                  print(
                      f"{step.step_number}. [{step.estimated_complexity}] {step.description}"
                  )


  asyncio.run(main())
  ```

**优势：**

* 完整的类型推断（TypeScript）和类型提示（Python）
* 通过 `safeParse()` 或 `model_validate()` 进行运行时验证
* 更优的错误信息
* 可组合、可复用的模式

## 输出格式配置

`outputFormat`（TypeScript）或 `output_format`（Python）选项接受一个对象，包含：

* `type`：设置为 `"json_schema"` 以启用结构化输出
* `schema`：一个 [JSON Schema](https://json-schema.org/understanding-json-schema/about) 对象，用于定义输出结构。您可以通过 `z.toJSONSchema()` 从 Zod schema 生成此对象，或通过 `.model_json_schema()` 从 Pydantic model 生成。

该 SDK 支持标准的 JSON Schema 功能，包括所有基本类型（object、array、string、number、boolean、null）、`enum`、`const`、`required`、嵌套对象和 `$ref` 定义。要获取支持功能的完整列表和限制，请参阅 [JSON Schema 限制](https://platform.claude.com/docs/en/build-with-claude/structured-outputs#json-schema-limitations)。

## 示例：TODO 追踪代理

本示例演示了结构化输出如何与多步骤工具调用协同工作。代理需要在代码库中查找 TODO 注释，然后为每个注释查询 git blame 信息。它会自主决定使用哪些工具（用 Grep 搜索，用 Bash 运行 git 命令），并将结果组合成一个单一的结构化响应。

该模式包含了可选字段（`author` 和 `date`），因为并非所有文件都能获得 git blame 信息。代理会填写能找到的信息，并省略其余部分。

  ```typescript TypeScript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  // Define structure for TODO extraction
  const todoSchema = {
    type: "object",
    properties: {
      todos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            file: { type: "string" },
            line: { type: "number" },
            author: { type: "string" },
            date: { type: "string" }
          },
          required: ["text", "file", "line"]
        }
      },
      total_count: { type: "number" }
    },
    required: ["todos", "total_count"]
  };

  // Agent uses Grep to find TODOs, Bash to get git blame info
  for await (const message of query({
    prompt: "Find all TODO comments in this codebase and identify who added them",
    options: {
      outputFormat: {
        type: "json_schema",
        schema: todoSchema
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success" && message.structured_output) {
      const data = message.structured_output as { total_count: number; todos: Array<{ file: string; line: number; text: string; author?: string; date?: string }> };
      console.log(`Found ${data.total_count} TODOs`);
      data.todos.forEach((todo) => {
        console.log(`${todo.file}:${todo.line} - ${todo.text}`);
        if (todo.author) {
          console.log(`  Added by ${todo.author} on ${todo.date}`);
        }
      });
    }
  }
  ```

  ```python Python
  import asyncio
  from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

  # Define structure for TODO extraction
  todo_schema = {
      "type": "object",
      "properties": {
          "todos": {
              "type": "array",
              "items": {
                  "type": "object",
                  "properties": {
                      "text": {"type": "string"},
                      "file": {"type": "string"},
                      "line": {"type": "number"},
                      "author": {"type": "string"},
                      "date": {"type": "string"},
                  },
                  "required": ["text", "file", "line"],
              },
          },
          "total_count": {"type": "number"},
      },
      "required": ["todos", "total_count"],
  }


  async def main():
      # Agent uses Grep to find TODOs, Bash to get git blame info
      async for message in query(
          prompt="Find all TODO comments in this codebase and identify who added them",
          options=ClaudeAgentOptions(
              output_format={"type": "json_schema", "schema": todo_schema}
          ),
      ):
          if isinstance(message, ResultMessage) and message.structured_output:
              data = message.structured_output
              print(f"Found {data['total_count']} TODOs")
              for todo in data["todos"]:
                  print(f"{todo['file']}:{todo['line']} - {todo['text']}")
                  if "author" in todo:
                      print(f"  Added by {todo['author']} on {todo['date']}")


  asyncio.run(main())
  ```

## 错误处理

当代理无法生成符合您模式的有效JSON时，结构化输出生成可能会失败。这通常发生在模式对任务过于复杂、任务本身不明确，或代理在尝试修复验证错误时达到重试限制的情况。

当错误发生时，结果消息包含一个`subtype`字段，指示问题所在：

| 子类型                                  | 含义                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| `success`                               | 输出已生成且验证成功                                         |
| `error_max_structured_output_retries`   | 代理在多次尝试后仍无法生成有效输出                           |

以下示例通过检查`subtype`字段来确定输出是否生成成功，或是否需要处理失败情况：

  ```typescript TypeScript
  for await (const msg of query({
    prompt: "Extract contact info from the document",
    options: {
      outputFormat: {
        type: "json_schema",
        schema: contactSchema
      }
    }
  })) {
    if (msg.type === "result") {
      if (msg.subtype === "success" && msg.structured_output) {
        // Use the validated output
        console.log(msg.structured_output);
      } else if (msg.subtype === "error_max_structured_output_retries") {
        // Handle the failure - retry with simpler prompt, fall back to unstructured, etc.
        console.error("Could not produce valid output");
      }
    }
  }
  ```

  ```python Python
  async for message in query(
      prompt="Extract contact info from the document",
      options=ClaudeAgentOptions(
          output_format={"type": "json_schema", "schema": contact_schema}
      ),
  ):
      if isinstance(message, ResultMessage):
          if message.subtype == "success" and message.structured_output:
              # Use the validated output
              print(message.structured_output)
          elif message.subtype == "error_max_structured_output_retries":
              # Handle the failure
              print("Could not produce valid output")
  ```

**避免错误的提示：**

* **保持模式专注。** 深层嵌套且具有许多必填字段的模式更难满足。从简单开始，根据需要增加复杂性。
* **将模式与任务匹配。** 如果任务可能不包含您的模式所需的所有信息，请将这些字段设为可选。
* **使用清晰的提示词。** 模糊的提示词会让代理更难知道该生成什么输出。

## 相关资源

* [JSON Schema documentation](https://json-schema.org/)：学习使用嵌套对象、数组、枚举和验证约束定义复杂模式的 JSON Schema 语法
* [API Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)：直接在 Claude API 中使用结构化输出进行无需工具使用的单轮请求
* [Custom tools](/en/agent-sdk/custom-tools)：为您的代理提供自定义工具，以便在返回结构化输出之前的执行期间调用