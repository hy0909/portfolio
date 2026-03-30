# Portfolio

정적 포트폴리오 사이트입니다. GitHub Pages에 바로 배포할 수 있도록 구성했습니다.

## Local Preview

정적 파일이라서 아무 서버로나 열 수 있습니다.

```bash
python3 -m http.server 3000
```

또는 VS Code Live Server 같은 정적 서버를 사용해도 됩니다.

## Deploy to GitHub Pages

1. 이 내용을 `https://github.com/hy0909/portfolio` 저장소에 푸시합니다.
2. GitHub 저장소의 `Settings > Pages`로 이동합니다.
3. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
4. 브랜치는 `main`, 폴더는 `/ (root)`를 선택합니다.
5. 저장 후 배포가 완료되면 프로젝트 사이트 URL이 생성됩니다.

프로젝트 저장소이므로 일반적으로 주소는 아래 형태입니다.

`https://hy0909.github.io/portfolio/`

## Figma MCP Workflow

Figma MCP는 현재 연결 가능한 상태입니다. 다음 중 하나를 주면 화면을 더 정확하게 구현할 수 있습니다.

- Figma 파일 URL
- 특정 프레임 또는 노드 URL

그 링크를 받으면 디자인 구조를 읽고, 현재 사이트를 그 시안 기준으로 맞춰 수정할 수 있습니다.
