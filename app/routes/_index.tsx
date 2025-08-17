import { useState } from "react";
import { Form } from "@remix-run/react";

const APP_PASSWORD = "westy731"; // 🔑 change this!

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const password = formData.get("password");

  if (password === APP_PASSWORD) {
    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": `auth=ok; Path=/; HttpOnly; SameSite=Lax`,
        Location: "/",
      },
    });
  }

  return new Response("Unauthorized", { status: 401 });
};

export const loader = async ({ request }: { request: Request }) => {
  const cookie = request.headers.get("Cookie");
  if (cookie && cookie.includes("auth=ok")) {
    return new Response(null, {
      status: 302,
      headers: { Location: `/${crypto.randomUUID()}` },
    });
  }

  return null;
};

export default function Index() {
  const [error, setError] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6", // light gray background
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2.5rem",
          borderRadius: "1rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          🔒 Enter Password
        </h2>
        <Form
          method="post"
          onSubmit={(e) => {
            if ((e.nativeEvent as SubmitEvent).submitter) setError(true);
          }}
        >
          <input
            type="password"
            name="password"
            placeholder="Password"
            style={{
              padding: "0.75rem 1rem",
              width: "100%",
              marginBottom: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid #d1d5db",
              fontSize: "1rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 1rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#1d4ed8")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#2563eb")
            }
          >
            Unlock
          </button>
        </Form>
        {error && (
          <p style={{ color: "#dc2626", marginTop: "1rem", fontSize: "0.9rem" }}>
            Wrong password. Try again.
          </p>
        )}
      </div>
    </div>
  );
}
