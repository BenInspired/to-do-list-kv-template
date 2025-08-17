import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import { TodoManager } from "~/to-do-manager";

// --- helper to check cookie ---
function isAuthenticated(request: Request) {
  const cookie = request.headers.get("Cookie");
  return cookie && cookie.includes("auth=ok");
}

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
  if (!isAuthenticated(request)) {
    return redirect("/"); // force login if not authed
  }

  const todoManager = new TodoManager(
    context.cloudflare.env.TO_DO_LIST,
    params.id,
  );
  const todos = await todoManager.list();
  return { todos };
};

export async function action({ request, context, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // handle logout
  if (intent === "logout") {
    return redirect("/", {
      headers: {
        "Set-Cookie": `auth=; Path=/; HttpOnly; Max-Age=0`,
      },
    });
  }

  const todoManager = new TodoManager(
    context.cloudflare.env.TO_DO_LIST,
    params.id,
  );

  switch (intent) {
    case "create": {
      const text = formData.get("text");
      if (typeof text !== "string" || !text)
        return Response.json({ error: "Invalid text" }, { status: 400 });
      await todoManager.create(text);
      return { success: true };
    }

    case "toggle": {
      const id = formData.get("id") as string;
      await todoManager.toggle(id);
      return { success: true };
    }

    case "delete": {
      const id = formData.get("id") as string;
      await todoManager.delete(id);
      return { success: true };
    }

    default:
      return Response.json({ error: "Invalid intent" }, { status: 400 });
  }
}

export default function TodoPage() {
  const { todos } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* lock button top right */}
        <div className="flex justify-end mb-4">
          <Form method="post">
            <button
              type="submit"
              name="intent"
              value="logout"
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
            >
              🔒 Lock
            </button>
          </Form>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Todo List
        </h1>

        <Form method="post" className="mb-8 flex gap-2">
          <input
            type="text"
            name="text"
            className="flex-1 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm px-4 py-2"
            placeholder="Add a new todo..."
          />
          <button
            type="submit"
            name="intent"
            value="create"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Add
          </button>
        </Form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <Form method="post" className="flex-1 flex items-center gap-2">
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  name="intent"
                  value="toggle"
                  className="text-gray-500 hover:text-blue-500"
                >
                  <span
                    className={
                      todo.completed ? "line-through text-gray-400" : ""
                    }
                  >
                    {todo.text}
                  </span>
                </button>
              </Form>

              <Form method="post">
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </Form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
