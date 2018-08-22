export default (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, '-');
