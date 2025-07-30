import headerHtml from '../../../figma_export/org/components/header_not_advertiser/pages/0001.html?raw';

function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  return match ? match[1] : html;
}

const headerBody = extractBody(headerHtml);

export interface HeaderData {
  name: string;
  category: string;
  rating: number;
  reviews: number;
  time?: string;
}

export function createHeaderNotAdvertiser(data: HeaderData): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = headerBody.trim();
  const element = template.content.firstElementChild as HTMLElement;

  const title = element.querySelector('.inline-element-31');
  if (title) title.textContent = data.name;

  const subtitle = element.querySelector('.inline-element-36');
  if (subtitle) subtitle.textContent = data.category;

  const rating = element.querySelector('.inline-element-75');
  if (rating) rating.textContent = data.rating.toFixed(1);

  const reviews = element.querySelector('.inline-element-78');
  if (reviews) reviews.textContent = `${data.reviews} оценок`;

  const time = element.querySelector('.inline-element-84');
  if (time && data.time) time.textContent = data.time;

  return element.cloneNode(true) as HTMLElement;
}
