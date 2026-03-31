# Portfolio

정적 포트폴리오 사이트입니다. GitHub Pages에 배포되며, GitHub Actions가 Notion DB를 읽어 `data/notion-boxes.json`을 갱신한 뒤 사이트를 다시 배포합니다.

## Local Preview

정적 파일이라서 아무 서버로나 열 수 있습니다.

```bash
python3 -m http.server 3000
```

또는 VS Code Live Server 같은 정적 서버를 사용해도 됩니다.

## Notion Auto Sync

다음 GitHub Secrets가 필요합니다.

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

노션 DB는 아래 컬럼을 기준으로 읽습니다.

- `title`
- `summation`
- `body`
- `date`
- `img`
- `project` 또는 `slot`

자동 반영 방식:

- `main` 브랜치에 푸시할 때 즉시 배포
- 추가로 15분마다 자동으로 Notion을 다시 읽고 재배포

즉, 노션을 수정하면 최대 약 15분 안에 웹사이트에 반영됩니다.

## Deploy to GitHub Pages

1. 이 내용을 `https://github.com/hy0909/portfolio` 저장소에 푸시합니다.
2. GitHub 저장소의 `Settings > Pages`에서 GitHub Actions 배포가 허용되어 있어야 합니다.
3. 저장소의 `Settings > Secrets and variables > Actions`에 Notion 시크릿을 넣습니다.
4. `main`에 푸시하면 배포가 시작됩니다.

프로젝트 저장소이므로 일반적으로 주소는 아래 형태입니다.

`https://hy0909.github.io/portfolio/`

## Figma MCP Workflow

Figma MCP는 현재 연결 가능한 상태입니다. 다음 중 하나를 주면 화면을 더 정확하게 구현할 수 있습니다.

- Figma 파일 URL
- 특정 프레임 또는 노드 URL

그 링크를 받으면 디자인 구조를 읽고, 현재 사이트를 그 시안 기준으로 맞춰 수정할 수 있습니다.
