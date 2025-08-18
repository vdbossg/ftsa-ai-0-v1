export async function updateStrength() {
  try {
    const res = await fetch("/api/brain/strength");
    const data = await res.json();
    console.log("Strength updated:", data);
    // could store in global state / context here
  } catch (err) {
    console.error("Error updating strength", err);
  }
}
