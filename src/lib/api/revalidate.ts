/**
 * Asks the app to drop its cached storefront pages after a catalogue edit.
 * Failure is not worth surfacing: the cached copy expires on its own shortly.
 */
export async function revalidateStorefront(tags: string[]) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {
    // Ignored on purpose.
  }
}
