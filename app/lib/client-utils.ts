export function prettyDate(date: string) {
  return new Date(date).toLocaleDateString();
}
export const imageLoader = ({ src }: { src: string }) => {
  return `https://image.tmdb.org/t/p/original${src}`;
};
