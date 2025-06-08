// TODO: allow creator to have a popup where they can then edit the return advice.
// TODO: Have an function that assesses the entire board and re-makes w/ suggestions
import OpenAI from "openai";

interface KanbanSuggestion {
  title: string;
  description: string;
  labels: string[];
  dueDate: Date;
  priority: string;
  assignedTo: string;
}

/**
 * Use ChatGPT to analyze a Kanban board state and return structured JSON advice.
 *
 * @param task - A string representing the new task
 *   Example format:
 *   "Write a widget to show sales data by region, due next Tuesday, assign to Jess"
 * @returns A parsed JSON object conforming to KanbanAdvice.
 */
export const generateKanbanAdviceJson = async (
  task: string,
  assigneeId: string
): Promise<KanbanSuggestion> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = `
You are an assistant that converts free-form task descriptions into a JSON object with the following fields:
- title: a short summary (max 60 chars).
- description: longer details.
- labels: an array of string labels (tags). Be sure to assign labels based on the task's field and side of the tech stack (if necessary).
- dueDate: in ISO format (YYYY-MM-DD), if mentioned; otherwise determine how long this task should take.
- assignedTo: ID of assignee (string), if mentioned; otherwise null.
- priority: one of "High", "Medium", or "Low"; estimate based on severity words or context.

Output ONLY valid JSON. For example:
{
  "title": "Fix sales widget by region",
  "description": "Create a widget to show sales data by region as described in Q2 meeting notes.",
  "labels": ["frontend", "Sales"],
  "dueDate": "2025-06-10",
  "assignedTo": "Jess",
  "priority": "High"
}
If any field cannot be inferred, set it to null or an empty array. DO NOT include the ID of the assigned user in the "description" field.
Here is the task: ${task}, assign to user with ID: ${assigneeId}. DO NOT include the ID of the assigned user in the "description" field.
  `.trim();

  // Instruct the model to return valid JSON and follow the schema below.
  //   - title: a short summary (max 60 chars).
  //   - description: longer details.
  //   - labels: an array of string labels (tags).
  //   - dueDate: in ISO format (YYYY-MM-DD), if mentioned; otherwise null.
  //   - assignedTo: name of assignee (string), if mentioned; otherwise null.
  //   - priority: one of "High", "Medium", or "Low"; estimate based on severity words or context.
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
    ],
  });

  const raw = completion.choices[0].message.content?.trim();
  if (!raw) {
    throw new Error("Could not get response from OpenAI");
  }

  try {
    // Parse the JSON. If the model produced valid JSON, this will succeed.
    const advice: KanbanSuggestion = JSON.parse(raw);
    return advice;
  } catch (err) {
    // If parsing fails, you might throw an error or return an empty structure.
    throw new Error(
      `Failed to parse JSON from OpenAI response: ${err}\nResponse was:\n${raw}`
    );
  }
};
