export const normalizeReference = (value) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function recoverFile(file, submission) {
  if (submission === null) return false;
  if (file.method === "decode")
    return [file.answer, ...(file.aliases || [])].some(answer => normalizeReference(answer) === normalizeReference(submission));
  if (file.method === "match")
    return submission && typeof submission === "object" && !Array.isArray(submission) &&
      Object.keys(submission).length === file.rows.length &&
      file.rows.every(row => submission[row.id] === file.solution[row.id]);
  if (file.method === "timeline")
    return Array.isArray(submission) && submission.length === file.order.length &&
      submission.every((id, i) => id === file.order[i]);
  return false;
}
export function fileAnswer(file) {
  if (file.method === "decode") return file.answer;
  if (file.method === "timeline") return file.order.map(id => file.items.find(item => item.id === id).label).join(" → ");
  return file.rows.map(row => `${row.clue} → ${file.choices.find(choice => choice.id === file.solution[row.id]).label}`).join(" · ");
}
export function validCollectionProgress(collection, value) {
  if (!Array.isArray(value) || value.length > collection.files.length) return [];
  return value.every((entry, index) => entry && entry.id === collection.files[index].id &&
    (entry.submission === null || recoverFile(collection.files[index], entry.submission))) ? value : [];
}
