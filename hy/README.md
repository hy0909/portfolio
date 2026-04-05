# hy portfolio

이 폴더는 조직 공용 `portfolio` 저장소 안에서 `hy` 전용 포트폴리오를 관리하기 위한 복사본입니다.

원본 개인 작업물을 그대로 유지하면서, 조직 저장소에서는 `hy/` 아래 파일만 커밋하면 다른 사람 작업과 충돌을 줄일 수 있습니다.

브라우저가 직접 Notion API를 호출하지 않고, GitHub Actions가 배포 시점에 Notion 데이터를 가져와 `data/notion-boxes.json`을 생성합니다. 그래서 토큰이 프론트엔드에 노출되지 않습니다.

## Local Preview

정적 파일 프리뷰:

```bash
python3 -m http.server 3000
```

그 다음 `http://localhost:3000`에서 확인할 수 있습니다.

## GitHub Pages + Notion 연결

GitHub 저장소 `Settings > Secrets and variables > Actions`에 아래 시크릿을 추가하세요.

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

Notion 데이터베이스는 아래 속성을 기준으로 읽습니다.

- `title` : `Title`
- `body` : `Text`
- `date` : `Date`
- `img` : `Files & media`

배포 워크플로가 실행되면 `scripts/fetch-notion.mjs`가 Notion 데이터를 읽어 정적 JSON 파일을 생성하고, 그 결과물이 GitHub Pages에 배포됩니다.

## Figma MCP

Figma MCP는 연결 가능한 상태입니다. 1주일 뒤 Figma 파일 URL이나 특정 노드 URL을 주면, 현재 이 노션 기반 레이아웃을 유지하거나 확장하는 방식으로 정확히 맞춤 구현할 수 있습니다.
