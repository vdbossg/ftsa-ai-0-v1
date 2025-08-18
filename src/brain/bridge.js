export async function getBrainCommand(account) {
  const res = await fetch(`/api/brain/command?account=${account}`);
  return await res.json();
}
