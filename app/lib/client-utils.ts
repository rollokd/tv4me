export function prettyDate(date: string) {
  return new Date(date).toLocaleDateString();
}
export const imageLoader = ({ src, width }: { src: string; width: number }) => {
  return `https://image.tmdb.org/t/p/original${src}`;
};
