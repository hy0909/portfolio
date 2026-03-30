const projects = [
  {
    title: "Portfolio Platform",
    year: "2026",
    description:
      "개인 작업과 디자인 감도를 한 화면에 담는 웹 포트폴리오. GitHub Pages 기반 정적 배포를 전제로 구성해 유지보수와 확장이 쉽도록 설계했습니다.",
    tags: ["Web", "Portfolio", "Frontend"],
    href: "https://github.com/hy0909/portfolio",
    image: "./assets/horizontal.svg",
    accent: "Live Base",
  },
  {
    title: "Figma to Browser",
    year: "Workflow",
    description:
      "Figma 시안을 컴포넌트 단위로 해석하고 실제 반응형 웹으로 구현하는 작업 흐름. 디자인 언어를 코드로 번역하는 데 초점을 둡니다.",
    tags: ["Figma", "Implementation", "System"],
    href: "https://github.com/hy0909",
    image: "./assets/square.svg",
    accent: "MCP Ready",
  },
  {
    title: "Visual Story Blocks",
    year: "Selected",
    description:
      "텍스트, 이미지, 구조를 리듬감 있게 쌓아 브랜드와 프로젝트의 맥락이 자연스럽게 읽히도록 만든 편집형 레이아웃 스터디.",
    tags: ["Editorial", "UI", "Responsive"],
    href: "mailto:pongg005@naver.com",
    image: "./assets/horizontal.svg",
    accent: "Editorial",
  },
];

const projectGrid = document.querySelector("#project-grid");

function renderProjects() {
  projectGrid.innerHTML = projects
    .map(
      (project, index) => `
        <article class="project-card reveal" style="transition-delay: ${index * 90}ms">
          <div class="project-visual">
            <img src="${project.image}" alt="${project.title}" />
            <span class="project-overlay">${project.accent}</span>
          </div>
          <div class="project-content">
            <div class="project-header">
              <div class="project-title-row">
                <p class="project-title">${project.title}</p>
                <p class="project-meta">${project.year}</p>
              </div>
              <p class="project-description">${project.description}</p>
            </div>
            <div class="project-tags">
              ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
            </div>
            <a class="project-link" href="${project.href}" target="_blank" rel="noreferrer">Open</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function observeReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
    },
  );

  revealItems.forEach((item) => observer.observe(item));
}

renderProjects();
observeReveal();
