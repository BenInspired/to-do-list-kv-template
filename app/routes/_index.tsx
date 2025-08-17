import { useState } from "react";
import { Form } from "@remix-run/react";

const APP_PASSWORD = "P@SSBC2549"; // 🔑 change this!

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const password = formData.get("password");

  if (password === APP_PASSWORD) {
    // store a cookie so user stays logged in
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
    // user is authenticated → continue to to-do list
    return new Response(null, {
      status: 302,
      headers: { Location: `/${crypto.randomUUID()}` },
    });
  }

  // if not authenticated, show password form
  return null;
};

export default function Index() {
  const [error, setError] = useState(false);

  return (
    <div style={{ maxWidth: "400px", margin: "3rem auto", textAlign: "center" }}>
      <h2>Password required</h2>
      <Form
        method="post"
        onSubmit={(e) => {
          // if last attempt failed, show error
          if ((e.nativeEvent as SubmitEvent).submitter) setError(true);
        }}
      >
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Unlock
        </button>
      </Form>
      {error && <p style={{ color: "red" }}>Wrong password. Try again.</p>}
    </div>
  );
}
