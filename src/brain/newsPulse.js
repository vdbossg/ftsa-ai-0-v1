export async function updateNews() {
  try {
    const res = await fetch("/api/news/today");
    const data = await res.json();
    console.log("News updated:", data);
  } catch (err) {
    console.error("Error updating news", err);
  }
}
