const photo = (name) => `/static/demo/photos/${name}.jpg`;

const CATEGORY_VISUALS = {
  "website-development": photo("web-portal"),
  "web-application-development": photo("dashboard"),
  "mobile-application-development": photo("mobile-app"),
  "game-development": photo("game-art"),
  "digital-marketing": photo("data-viz"),
  "ui-ux-product-design": photo("design-desk"),
  "branding-creative-services": photo("abstract-3d-2"),
  "ai-machine-learning-data": photo("abstract-3d"),
  "cloud-devops-infrastructure": photo("server"),
  "cybersecurity-technical-consulting": photo("cyber"),
  "emerging-specialized-technologies": photo("circuit"),
};

export function categoryVisual(slug) {
  return CATEGORY_VISUALS[slug] || photo("global-tech");
}

export default CATEGORY_VISUALS;
